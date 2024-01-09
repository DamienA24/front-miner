// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}

pragma solidity ^0.8.19;

library Ref {
    function _generate(uint256 _nonce) internal view returns (string memory) {
        uint rand = uint(
            keccak256(abi.encodePacked(msg.sender, block.timestamp, _nonce))
        );
        string memory hash = _toAlphabetString(rand);
        return _substring(hash, 0, 5);
    }

    function _toAlphabetString(
        uint value
    ) internal pure returns (string memory) {
        bytes
            memory alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        bytes memory result = new bytes(32);
        for (uint i = 0; i < 32; i++) {
            result[i] = alphabet[value % 62];
            value /= 62;
        }
        return string(result);
    }

    function _substring(
        string memory str,
        uint startIndex,
        uint endIndex
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = 0; i < endIndex - startIndex; i++) {
            result[i] = strBytes[i + startIndex];
        }
        return string(result);
    }
}

contract Printer is Ownable, ReentrancyGuard {
    uint256 public dailyAPY;

    uint256 public accTokenPerShare;

    uint256 public endTimestamp;

    uint256 public startTimestamp;

    uint256 public lastRewardTimestamp;
    uint256 public rewardPerSecond;

    bool public vaultOpen;

    uint256 public PRECISION_FACTOR =
        uint256(10 ** (uint256(30) - DECIMALS_REWARD_TOKEN));
    uint256 constant DECIMALS_REWARD_TOKEN = 18;

    address public devAddress = 0xb01ba27d47608160E86A623a0aE16AC3566B3371;

    mapping(address => UserInfo) public userInfo;

    mapping(string => address) public referer;
    mapping(address => string) public referalCode;

    uint256 public totalReferrer;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 place;
    }

    event Deposit(address indexed user, uint256 amount);
    event NewStartAndEndTimestamp(uint256 startTimestamp, uint256 endTimestamp);
    event NewRewardPerSecond(uint256 rewardPerSecond);
    event Claim(address indexed user, uint256 amount);
    event Compound(address indexed user, uint256 amount);

    constructor(
        uint256 _rewardPerSecond,
        uint256 _startTimestamp,
        uint256 _endTimestamp,
        uint256 _dailyAPY
    ) {
        require(
            _startTimestamp < _endTimestamp,
            "New startTimestamp must be lower than new endTimestamp"
        );

        rewardPerSecond = _rewardPerSecond;
        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
        dailyAPY = _dailyAPY;

        lastRewardTimestamp = startTimestamp;

        transferOwnership(msg.sender);
    }

    function deposit(string memory referral) public payable {
        require(vaultOpen, "Vault is closed");
        require(msg.value > 0, "Deposit: Amount must be greater than 0");

        UserInfo storage user = userInfo[msg.sender];

        _updatePool();

        user.amount = user.amount + msg.value;

        user.rewardDebt = (user.amount * accTokenPerShare) / PRECISION_FACTOR;

        if (bytes(referral).length > 0) {
            if (
                referer[referral] != msg.sender &&
                referer[referral] != address(0x0)
            ) {
                uint256 devFee = (msg.value * 3) / 100;
                uint256 refFee = (msg.value * 2) / 100;
                (bool sent, ) = payable(devAddress).call{value: devFee}("");
                (sent, ) = payable(referer[referral]).call{value: refFee}("");

                require(sent, "Failed to send MATIC");
            } else {
                uint256 devFee = (msg.value * 5) / 100;
                (bool sent, ) = payable(devAddress).call{value: devFee}("");
                require(sent, "Failed to send MATIC");
            }
        } else {
            uint256 devFee = (msg.value * 5) / 100;
            (bool sent, ) = payable(devAddress).call{value: devFee}("");
            require(sent, "Failed to send MATIC");
        }

        emit Deposit(msg.sender, msg.value);
    }

    function claim() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];

        _updatePool();

        uint256 pending = _pendingRewards(msg.sender);

        if (pending > 0) {
            uint256 contractBalance = address(this).balance;
            if (contractBalance >= pending) {
                uint256 devFee = (pending * 5) / 100;
                (bool sentDev, ) = payable(devAddress).call{value: devFee}("");
                (bool sent, ) = payable(msg.sender).call{
                    value: pending - devFee
                }("");
                require(sentDev, "Failed to send MATIC");
                require(sent, "Failed to send MATIC");
            }
        }

        user.rewardDebt = (user.amount * accTokenPerShare) / PRECISION_FACTOR;

        emit Claim(msg.sender, pending);
    }

    function compoundRewards() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];

        _updatePool();

        uint256 pending = _pendingRewards(msg.sender);

        require(pending > 0, "Nothing to compound");

        user.amount += pending;
        user.rewardDebt = (user.amount * accTokenPerShare) / PRECISION_FACTOR;

        emit Compound(msg.sender, pending);
    }

    function updateRewardPerSecond(
        uint256 _rewardPerSecond
    ) external onlyOwner {
        require(block.timestamp < startTimestamp, "Pool has started");
        require(
            (PRECISION_FACTOR * _rewardPerSecond) /
                (10 ** DECIMALS_REWARD_TOKEN) >=
                100_000_000,
            "rewardPerSecond must be larger"
        );
        rewardPerSecond = _rewardPerSecond;
        emit NewRewardPerSecond(_rewardPerSecond);
    }

    function updateStartAndEndTimestamp(
        uint256 _startTimestamp,
        uint256 _endTimestamp
    ) external onlyOwner {
        require(block.timestamp < startTimestamp, "Pool has started");
        require(
            _startTimestamp < _endTimestamp,
            "New startTimestamp must be lower than new endTimestamp"
        );
        require(
            block.timestamp < _startTimestamp,
            "New startTimestamp must be higher than current block timestamp"
        );

        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;

        lastRewardTimestamp = startTimestamp;

        emit NewStartAndEndTimestamp(_startTimestamp, _endTimestamp);
    }

    function getPendingRewards(address _user) public view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 stakedTokenSupply = address(this).balance;
        if (block.timestamp > lastRewardTimestamp && stakedTokenSupply != 0) {
            uint256 multiplier = _getMultiplier(
                lastRewardTimestamp,
                block.timestamp
            );
            uint256 rewards = multiplier * rewardPerSecond;
            uint256 adjustedTokenPerShare = accTokenPerShare +
                (rewards * PRECISION_FACTOR) /
                stakedTokenSupply;
            return
                (user.amount * adjustedTokenPerShare) /
                PRECISION_FACTOR -
                user.rewardDebt;
        } else {
            return
                (user.amount * accTokenPerShare) /
                PRECISION_FACTOR -
                user.rewardDebt;
        }
    }

    function _updatePool() internal {
        if (block.timestamp <= lastRewardTimestamp) {
            return;
        }

        uint256 stakedTokenSupply = address(this).balance;

        if (stakedTokenSupply == 0) {
            lastRewardTimestamp = block.timestamp;
            return;
        }

        rewardPerSecond = ((stakedTokenSupply * dailyAPY) / 100) / 1 days;

        uint256 multiplier = _getMultiplier(
            lastRewardTimestamp,
            block.timestamp
        );
        uint256 rewards = multiplier * rewardPerSecond;
        accTokenPerShare =
            accTokenPerShare +
            (rewards * PRECISION_FACTOR) /
            stakedTokenSupply;
        lastRewardTimestamp = block.timestamp;
    }

    function _getMultiplier(
        uint256 _from,
        uint256 _to
    ) internal view returns (uint256) {
        if (_to <= endTimestamp) {
            return _to - _from;
        } else if (_from >= endTimestamp) {
            return 0;
        } else {
            return endTimestamp - _from;
        }
    }

    function _pendingRewards(address _user) private view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 stakedTokenSupply = address(this).balance;
        if (block.timestamp > lastRewardTimestamp && stakedTokenSupply != 0) {
            uint256 multiplier = _getMultiplier(
                lastRewardTimestamp,
                block.timestamp
            );
            uint256 rewards = multiplier * rewardPerSecond;
            uint256 adjustedTokenPerShare = accTokenPerShare +
                (rewards * PRECISION_FACTOR) /
                stakedTokenSupply;
            return
                (user.amount * adjustedTokenPerShare) /
                PRECISION_FACTOR -
                user.rewardDebt;
        } else {
            return
                (user.amount * accTokenPerShare) /
                PRECISION_FACTOR -
                user.rewardDebt;
        }
    }

    function createReferralCode() public {
        string memory code = Ref._generate(totalReferrer);

        referer[code] = msg.sender;
        referalCode[msg.sender] = code;

        totalReferrer++;
    }

    function setVaultOpen(bool _vaultOpen) external onlyOwner {
        vaultOpen = _vaultOpen;
    }
}
