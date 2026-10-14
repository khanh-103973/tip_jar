// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TipJar {
    IERC20 public immutable USDC;
    address public immutable CREATOR;

    event TipSent(address indexed from, uint256 amount, string message);

    constructor(address creator_, address usdc_) {
        require(creator_ != address(0), "TipJar: creator is zero");
        require(usdc_ != address(0), "TipJar: usdc is zero");

        CREATOR = creator_;
        USDC = IERC20(usdc_);
    }

    function sendTip(uint256 amount, string calldata message) external {
        require(USDC.transferFrom(msg.sender, CREATOR, amount), "TipJar: transfer failed");
        emit TipSent(msg.sender, amount, message);
    }

    function getCreator() external view returns (address) {
        return CREATOR;
    }
}
