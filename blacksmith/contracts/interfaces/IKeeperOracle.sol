// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

interface IKeeperOracle {
    function current(
        address,
        uint256,
        address
    ) external view returns (uint256);

    function pairFor(address, address) external view returns (address);

    function observationLength(address) external view returns (uint256);
}
