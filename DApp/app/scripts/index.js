// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
// import metaCoinArtifact from '../../build/contracts/MetaCoin.json'
import computerShopArtifact from '../../build/contracts/computerShop.json'

const computerShop = contract(computerShopArtifact)
let user

let accounts
let account

const App = {
    start: function () {
        const self = this
        //console.log(web3.currentProvider)
        computerShop.setProvider(web3.currentProvider)
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert('There was an error fetching your accounts.')
                return
            }

            if (accs.length === 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
                return
            }

            accounts = accs
            account = accounts[0]

            // User initial as owner
            user = accounts[0]
            // console.log(accs)
            // console.log("First user: " + user)

            let meta
            computerShop.deployed().then(function(instance) {
                meta = instance
                meta.sellerInit(account, {from:account})
            }).catch(function (e) {
                console.log(e)
                self.setStatus("Init error!")
            })

            self.refreshBalance()
        })

        console.log("Start: Complete!")
    },

    setStatus: function (message) {
        const status = document.getElementById("message")
        status.innerHTML = message
    },

    refreshBalance: function () {
        const self = this

        let meta
        computerShop.deployed().then(function (instance) {
            meta = instance
            return meta.getBalance.call({ from: user })
        }).then(function (value) {
            var ether_value = parseInt(web3.fromWei(value.toNumber(), 'ether'))
            console.log("refreshBalance: 当前用户的账户余额为：" + ether_value + " ether")

            // 修改页面上的信息
            const balanceElement = document.getElementById("Balance")
            balanceElement.innerHTML = ether_value
        }).catch(function (e) {
            console.log(e)
            self.setStatus('refreshBalance: 取得账户余额失败.')
        })
    },

    sendCoin: function (sendReceiver) {
        const self = this

        let meta
        computerShop.deployed().then(function (instance) {
            const amount = parseInt(document.getElementById("money").value)
            const receiver = sendReceiver
            console.log("sendCoin: " + amount)
    
            self.setStatus("sendCoin: 正在处理交易...")
            meta = instance
            // 向目标地址转帐
            return meta.sendCoin(receiver, amount, {from:user, value: web3.toWei(500, 'ether')})
        }).then(function (s) {
            console.log(s)
            self.setStatus("sendCoin: 交易转帐完成!")
            self.refreshBalance()
            
        }).catch(function (e) {
            console.log(e)
            self.setStatus("sendCoin: 转帐失败!")
        })
    },

    signUp: function () {
        const self = this
        var accountNumber = parseInt(document.getElementById("acc").value)
        user = accounts[accountNumber]
        if (typeof user !== 'undefined') {
            // console.log(user)
            const userStatus = document.getElementById("AccountStatus")
            userStatus.innerHTML = accountNumber
            self.setStatus("Account " + accountNumber)
            self.refreshBalance()
            console.log("signUp: Account: " + accountNumber + " Sign in")
        } else {
            alert("This user is not exit!")
            return
        }

    },

    costomerPurchase: function() {
        const self = this
        // 获取购买手机的信息和价格
        var phone = document.getElementById("phone").value
        var number = parseInt(document.getElementById("number").value)

        let meta
        computerShop.deployed().then(function (instance) {
            // 发起交易下单
            meta = instance
            return meta.get_price_by_name(phone, number)
        }).then(function(totalMoney) {
            console.log("TotalMoney: " + totalMoney)
            var moneyTag = document.getElementById("money")
            moneyTag.value = totalMoney
            meta.ordering(web3.toWei(totalMoney, 'ether'), {from:user, gas: 999999999999, value: web3.toWei(totalMoney, 'ether')})
            self.refreshBalance()
            return meta.get_status.call({from: user})
        }).then(function(status) {
            // 查询交易状态
            var status_value = status.toNumber()
            console.log(status_value)
            if (status_value == 2) {
                self.setStatus("NOTHING => ORDERING")
                console.log("NOTHING => ORDERING")
            } else {
                self.setStatus("状态查询失败!")
                console.log("CHECK FAIL!")
            }
        }).then (function() {
            self.setStatus("Current: ORDERING!")
            return meta.check_balances({from:accounts[0]})
        }).then(function(check) {
            var moneyInContract = parseInt(web3.fromWei(check.toNumber(), 'ether'))
            console.log("costomerPurchase: Contract has " + moneyInContract)
        }).catch (function (e) {
            console.log(e)
            self.setStatus("Error exist!")
        })  
    },

    sendPhone: function() {
        const self = this

        let meta
        computerShop.deployed().then(function (instance) {
            meta = instance
            meta.sending({from:user})
            return meta.get_status.call({from: user})
        }).then(function (status) {
            // 查询交易状态
            var status_value = status.toNumber()
            console.log(status_value)
            if (status_value == 3) {
                self.setStatus("ORDERING => SENDING")
                console.log("ORDERING => SENDING")
            } else {
                self.setStatus("状态查询失败!")
                console.log("CHECK FAIL!")
            }            
        }).catch(function (e) {
            console.log(e)
        })
        self.setStatus("Current: SENDING")
    },

    comfirmReceive: function() {
        const self = this

        let meta
        computerShop.deployed().then(function(instance) {
            meta = instance
            meta.comfirm({from:user})
            return meta.get_status.call({from: user})
        }).then(function (status) {
            // 查询交易状态
            var status_value = status.toNumber()
            console.log(status_value)
            if (status_value == 1) {
                self.setStatus("SENDING => NOTHING")
                console.log("SENDING => NOTHING")
            } else {
                self.setStatus("状态查询失败!")
                console.log("CHECK FAIL!")
            }    
        }).then(function () {
            meta.withdraw({from:accounts[0]})
        }).catch(function (e) {
            console.log(e)
        })

        self.setStatus("Current: NOTHING!")
    }
}

window.App = App;

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source.' +
        ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
        ' ensure you\'ve configured that source properly.' +
        ' If using MetaMask, see the following link.' +
        ' Feel free to delete this warning. :)' +
        ' http://truffleframework.com/tutorials/truffle-and-metamask'
      )
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider)
    } else {
      console.warn(
        'No web3 detected. Falling back to http://127.0.0.1:8545.' +
        ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
        ' Consider switching to Metamask for development.' +
        ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      )
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
      //console.log(web3.eth.accounts);
    }
  
    App.start()
  })