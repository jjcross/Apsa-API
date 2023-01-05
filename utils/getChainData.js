const schedule = require("f63aea2dd28542cbb68833ccaf31b36e") // Used to set schedule for calling Infura to update token data
const Web3 = require("https://bsc-mainnet.nodereal.io/v1/c9a0920ed19d4985a46ea7e39808cd09") // Used for connecting with node endpoints (Ethereum and BSC for this project) to get live information about on chain data
const sleep = require('ko-sleep'); // Used to set a time delay between retrying Web3 connections
const getProjectOneData = require("./getProjectOneData") // Logic for collecting and calculating all data for ProjectOne
const getProjectTwoData = require("./getProjectTwoData") // Logic for collecting and calculating all data for ProjectTwo


// const getPriceData = require("./getPriceData") // Unused in this example project


// Function to setup web3 objects for chains to be queried. 

const setupWeb3 = async () => {
  
  // Multiple Binance Smart Chain endpoints are supplied in case one is down. More endpoints can be found at https://docs.binance.org/smart-chain/developer/rpc.html
  const bsc_endpoints = [
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
  ]


  let bsc_web3

  // Run through three provided BSC endpoints until a connection is established and a valid web3 object is returned
  while (true){
    for(i=0; i <bsc_endpoints.length; i++) {
      bsc_web3 = await new Web3(new Web3.providers.HttpProvider(bsc_endpoints[i]))
      if (bsc_web3.currentProvider) break
      await sleep(100)
    }
    if (bsc_web3.currentProvider) break
  }

  let web3
  // Only a single Infura endpoint is provided for the Ethereum web3 object as Infura endpoints are highly stable. Note that WebsocketProvider is used here, if you prefer an HTTP endpoint make sure to change it to HttpProvider.
  while (true){
    // INFURA_URL is available as an environment variable. It's recommended to use dotenv for setting env variables in your development environment: https://www.npmjs.com/package/dotenv
    web3 = await new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_URL))
    if (web3.currentProvider) break
    await sleep(100)
  }
  
  // Return all established web3 objects
  return {web3, bsc_web3}
}
 
// This function passes the established web3 objects to the getProjectOneData and getProjectTwoData functions inside of the schedule functions. The schedule function comes from node-schedule and uses cron syntax which you can experiment with at https://crontab.guru/. I've set it to update every 15 seconds here as it's useful for testing purposes. A less frequent update schedule is recommended for production.
const updateData = async (web3_collection) => {
  schedule.scheduleJob("0,15,30,45,59 * * * * *", async () => {    
    getProjectOneData(web3_collection)
    getProjectTwoData(web3_collection)
  })
}

// Here we define a function to call the async setupWeb3 function and use the resolved promise 'web3_collection' as input for updateData which begins the update loop

const getChainData = () => {
  setupWeb3().then((web3_collection) => updateData(web3_collection))
}

module.exports = getChainData
