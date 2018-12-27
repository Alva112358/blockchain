pragma solidity ^0.5.0;

contract computerShop {

    // Use to finish the transaction.
    enum States { NOTHING, ORDERING, SENDING }
    // The shop's keeper.
    address public owner;

    // The computers.
    mapping(bytes32 => uint) public computers;

    // State
    States purchase_state;
    // Constructor, open a new computer shop.
    constructor() public {
        // Initialize the computers.
        computers["iPhone"] = 500;
        computers["Sumsung"] = 350;
        computers["HUAWEI"] = 390;

        purchase_state = States.NOTHING;
    }

    // Get specific computer's price.
    function get_price_by_name(bytes32 _name, uint number) public view returns (uint) {
        return computers[_name] * number;
    }

    // Buyers order a computer.
    function ordering(uint money) public payable {
        require (purchase_state == States.NOTHING, "NOT NOTHING");
        require (msg.sender != owner, "NOT BUYER");
        require (msg.sender.balance >= money, "NOT ENOUGH MONEY");

        purchase_state = States.ORDERING;
    }

    // Owner send the computer.
    function sending() public {
        require (purchase_state == States.ORDERING, "NOT ORDERING");
        require (owner == msg.sender, "NOT SELLER");

        purchase_state = States.SENDING;
    }

    // Buyers comfirm.
    function comfirm() public {
        require (purchase_state == States.SENDING, "NOT SENDING");
        require (msg.sender != owner, "NOT BUYER");
        
        purchase_state = States.NOTHING;
    }

    function withdraw() public payable {
        require (msg.sender == owner, "NOT SELLER");
        require (purchase_state == States.NOTHING, "NOT NOTHING");
        msg.sender.transfer(address(this).balance);
    }

    function check_balances() public view returns (uint) {
        require (owner == msg.sender, "NOT OWNER");
        return address(this).balance;
    }

    function get_status() public view returns (uint) {
        if (purchase_state == States.NOTHING) return 1;
        if (purchase_state == States.ORDERING) return 2;
        if (purchase_state == States.SENDING) return 3;
    }

    function getBalance() public view returns(uint) {
        return msg.sender.balance;
    }
    
    function sellerInit(address addr) public {
        owner = addr;
    }
}
