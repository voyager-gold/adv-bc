// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {UUPSProxiable} from "../upgradability/UUPSProxiable.sol";
import "../interfaces/IPriceOracleAggregator.sol";
import "../interfaces/IOracle.sol";

////////////////////////////////////////////////////////////////////////////////////////////
/// @title PriceOracleAggregator
/// @author @samparsky
/// @notice aggregator of price oracle for assets in LendingPairs
////////////////////////////////////////////////////////////////////////////////////////////

contract PriceOracleAggregator is UUPSProxiable, IPriceOracleAggregator {
    /// @dev admin allowed to update price oracle
    address public immutable admin;

    /// @notice token to the oracle address
    mapping(IERC20 => IOracle) public assetToOracle;

    modifier onlyAdmin() {
        require(msg.sender == admin, "ONLY_ADMIN");
        _;
    }

    constructor(address _admin) {
        require(_admin != address(0), "INVALID_ADMIN");
        admin = _admin;
    }

    /// @notice adds oracle for an asset e.g. ETH
    /// @param _asset the oracle for the asset
    /// @param _oracle the oracle address
    function updateOracleForAsset(IERC20 _asset, IOracle _oracle) external override onlyAdmin {
        require(address(_asset) != address(0), "INVALID_ASSET");
        require(address(_oracle) != address(0), "INVALID_ORACLE");
        assetToOracle[_asset] = _oracle;
        emit UpdateOracle(_asset, _oracle);
    }

    /// @notice returns price of token in USD in 1e8 decimals
    /// @param _token token to fetch price
    function getPriceInUSD(IERC20 _token) external override returns (uint256) {
        require(address(assetToOracle[_token]) != address(0), "INVALID_ORACLE");
        return assetToOracle[_token].getPriceInUSD();
    }

    /// @notice returns price of token in USD
    /// @param _token view price of token
    function viewPriceInUSD(IERC20 _token) external view override returns (uint256) {
        require(address(assetToOracle[_token]) != address(0), "INVALID_ORACLE");
        return assetToOracle[_token].viewPriceInUSD();
    }

    function proxiableUUID() public pure override returns (bytes32) {
        return keccak256("org.warp.contracts.warpvault.priceoralceaggregator");
    }

    function updateCode(address newAddress) external override onlyAdmin {
        _updateCodeAddress(newAddress);
    }
}
