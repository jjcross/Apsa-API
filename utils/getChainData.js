const schedule = require("node-schedule")
const Web3 = require("web3")
const sleep = require('ko-sleep');
const getprojectOneData = require("./getprojectOneData")
const getprojectTwoData = require("./getprojectTwoData")


// const getPriceData = require("./getPriceData")



// Set up chain data object
const chainData = {}

const setupWeb3 = async () => {
  
  
  const bsc_endpoints = [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
  ]

  
  let web3
  while (true){
    web3 = await new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_URL))
    if (web3.currentProvider) break
    await sleep(100)
  }

  let bsc_web3
  while (true){
    for(i=0; i <bsc_endpoints.length; i++) {
      bsc_web3 = await new Web3(new Web3.providers.HttpProvider(bsc_endpoints[i]))
      if (bsc_web3.currentProvider) break
      await sleep(100)
    }
    if (bsc_web3.currentProvider) break
  }

  
  // chainData.blockNumber = await web3.eth.getBlockNumber()

  return {web3, bsc_web3}
}




// chainData.timestamp = Date.now()
 

const updateData = async (web3_collection) => {
  schedule.scheduleJob("0,15,30,45,59 * * * * *", async () => {    
    getprojectOneData(web3_collection)
    getprojectTwoData(web3_collection)

  })
}

setupWeb3().then((web3_collection) => updateData(web3_collection))

module.exports = chainData
