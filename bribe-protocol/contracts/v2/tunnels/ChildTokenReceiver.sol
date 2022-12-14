// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Create2.sol";
import "../interfaces/IFxERC20.sol";

/**
 * @title FxERC20ChildTunnel
 */
abstract contract ChildTokenReceiver is Create2 {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");

    bytes32 public constant MAP_TOKEN = keccak256("MAP_TOKEN");

    string public constant SUFFIX_NAME = " (FXERC20)";

    string public constant PREFIX_SYMBOL = "fx";

    // event for token maping
    event TokenMapped(address indexed rootToken, address indexed childToken);

    // root to child token
    mapping(address => address) public rootToChildToken;

    // token template
    address public immutable tokenTemplate;

    constructor(address _tokenTemplate) {
        tokenTemplate = _tokenTemplate;
        require(_isContract(_tokenTemplate), "Token template is not contract");
    }

    //
    // Internal methods
    //

    function _mapToken(bytes memory syncData) internal returns (address) {
        (address rootToken, string memory name, string memory symbol, uint8 decimals) = abi.decode(
            syncData,
            (address, string, string, uint8)
        );

        // get root to child token
        address childToken = rootToChildToken[rootToken];

        // check if it's already mapped
        require(childToken == address(0x0), "FxERC20ChildTunnel: ALREADY_MAPPED");

        // deploy new child token
        bytes32 salt = keccak256(abi.encodePacked(rootToken));
        childToken = createClone(salt, tokenTemplate);
        IFxERC20(childToken).initialize(
            address(this),
            rootToken,
            string(abi.encodePacked(name, SUFFIX_NAME)),
            string(abi.encodePacked(PREFIX_SYMBOL, symbol)),
            decimals
        );

        // map the token
        rootToChildToken[rootToken] = childToken;
        emit TokenMapped(rootToken, childToken);

        // return new child token
        return childToken;
    }

    function _syncDeposit(bytes memory syncData) internal {
        (
            address rootToken,
            address depositor,
            address to,
            uint256 amount,
            bytes memory depositData
        ) = abi.decode(syncData, (address, address, address, uint256, bytes));
        address childToken = rootToChildToken[rootToken];

        // deposit tokens
        IFxERC20 childTokenContract = IFxERC20(childToken);
        childTokenContract.mint(address(this), amount);

        // call `onTokenTranfer` on `to` with limit and ignore error
        if (_isContract(to)) {
            uint256 txGas = 2000000;
            bool success = false;
            bytes memory data = abi.encodeWithSignature(
                "onTokenTransfer(address,address,address,address,uint256,bytes)",
                rootToken,
                childToken,
                depositor,
                to,
                amount,
                depositData
            );
            // solium-disable-next-line security/no-inline-assembly
            assembly {
                success := call(txGas, to, 0, add(data, 0x20), mload(data), 0, 0)
            }
        }
    }

    // check if address is contract
    function _isContract(address _addr) private view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }
}
