const addresses = require("../addresses/projectOne") // Get all relevant Ethereum and BSC addresses
const projectOneAbi = require("../abi/projectOneAbi.json") // Get the token ABI for the project. ABIs can be found on the Etherscan page for the contract if the contract has been verified. Otherwise you may need to ask your Solidity dev for it.
const numeral = require("numeral") // NPM package for formatting numbers
const db = require("./db") // Util for setting up DB and main DB methods

// Async function which takes in web3 collection, makes web3 calls to get current on chain data, formats data, and caches formatted data to MongoDB
const getProjectOneData = async (web3s) => {
    // Unpack web3 objects for Ethereum and BSC
    const {web3, bsc_web3} = web3s
    // Get Ethereum block number 
    const blockNumber = await web3.eth.getBlockNumber()
    // Get BSC block number - error handling used here due to unreliable BSC endpoints, best to add it for the Ethereum block number as well in production.
    let bsc_blockNumber
    try {
        bsc_blockNumber = await bsc_web3.eth.getBlockNumber() 
    }
    catch(err) {
        bsc_blockNumber = 0
        console.log("CANT GET bsc_blockNumber")
        console.log(err)
    }
    // Collect addresses in one 'addresses' object
    const {eth_addresses, bsc_addresses} = addresses
    // Set number formatting default
    numeral.defaultFormat("0,0");

    // Instantiate all smart contract object(s)

    // web3.eth.Contract() creates a smart contract object using the ABI and address of the contract which allows you to call all the smart contract functions listed in the ABI. Since we are not supplying a private key to our web3 object, we can only use it for reading on chain data, not for anything requiring signing - which is all we need for this project.
    // Here we instantiate the Ethereum smart contract object
    let projectOne = new web3.eth.Contract(projectOneAbi, eth_addresses.contract)
    // Here we instantiate the BSC smart contract object
    let bsc_projectOne
    try {
        bsc_projectOne = new bsc_web3.eth.Contract(projectOneAbi, bsc_addresses.contract)
    }
    catch(err) {
        console.log("couldn't connect to BSC")
        console.log(err)
    }
    
    // For converting to proper number of decimals. We use this to convert from raw numbers returned from web3 calls to human readable formatted numbers based on the decimals for each token.  
    const convert = (num, decimal) => {
        return Math.round((num / (10*10**(decimal-3))))/100
    }

    // Make tokenData object. This object is used for storing formatted and calculated results from web3 calls from both Ethereum and BSC web3 objects. It is divided into 3 sections for data on BSC, Ethereum, and aggregate data from both chains in 'combined'.

    let tokenData = {
        combined: {
            totalSupply: {value: null},
            circulatingSupply: {value: null},
        },
        eth: {
            totalSupply: {value: null},
            circulatingSupply: {value: null},
        },
        bsc: {
            totalSupply: {value: null},
            circulatingSupply: {value: null},
        }
    }
  
    // Get base Ethereum values 
    const burnt_on_eth = await projectOne.methods.balanceOf(eth_addresses.burnt).call() 

    tokenData.eth.totalSupply.value = await projectOne.methods.totalSupply().call()
    const team_1 = await projectOne.methods.balanceOf(eth_addresses.team_1).call() 
    const team_2 = await projectOne.methods.balanceOf(eth_addresses.team_2).call() 
    const team_3 = await projectOne.methods.balanceOf(eth_addresses.team_3).call() 
  
     // Get base BSC values 
    try {
        burnt_on_bsc = await bsc_projectOne.methods.balanceOf(bsc_addresses.burnt).call() 
    }
    catch(err){
        console.log(`burnt_on_bsc: ${err}`)
        burnt_on_bsc = err
    }

    try {
        tokenData.bsc.totalSupply.value = await bsc_projectOne.methods.totalSupply().call()
    }
    catch(err){
        console.log(`tokenData.bsc.totalSupply.value: ${err}`)
        tokenData.bsc.totalSupply.value = err
    }
    let  bsc_team_1 
    try {
         bsc_team_1 = await bsc_projectOne.methods.balanceOf(bsc_addresses.team_1).call() 
    }
    catch(err){
        console.log(`bsc_team_1: ${err}`)
        bsc_team_1 = err
    }
    let bsc_team_2 
    try {
        bsc_team_2 = await bsc_projectOne.methods.balanceOf(bsc_addresses.team_2).call() 
    }
    catch(err){
        console.log(`bsc_team_2: ${err}`)
        bsc_team_2 = err
    }

    // In the following section we perform calculations on base values returned from web3 calls to get the final values we want to return in our API.
    
    // Get derived values ETH
    const team_eth = Number(team_1) + Number(team_2) + Number(team_3)
    tokenData.eth.totalSupply.value -= burnt_on_eth
    tokenData.eth.circulatingSupply.value = Number(tokenData.eth.totalSupply.value) - Number(team_eth)
  
    // Get derived values BSC
    const team_bsc = Number(bsc_team_1) + Number(bsc_team_2) 
    tokenData.bsc.totalSupply.value -= burnt_on_bsc
    tokenData.bsc.circulatingSupply.value = Number(tokenData.bsc.totalSupply.value) - Number(team_bsc)
  
    // Get joint values
    tokenData.combined.totalSupply.value = tokenData.bsc.totalSupply.value + tokenData.eth.totalSupply.value 
    tokenData.combined.circulatingSupply.value = Number(tokenData.bsc.circulatingSupply.value) + Number(tokenData.eth.circulatingSupply.value)
       
    // Below we add additional information which is not strictly necessary if the API is used only for CG and CMC listing, but may be desired for other purposes such as a token dashboard.

    // Set up descriptions 
    tokenData.eth.totalSupply.description = "Total supply of projectOne on ETH"
    tokenData.bsc.totalSupply.description = "Total supply of projectOne on BSC"
  
    tokenData.eth.circulatingSupply.description = "Circulating supply of projectOne on ETH"
    tokenData.bsc.circulatingSupply.description = "Circulating supply of projectOne on BSC"
  
    tokenData.combined.totalSupply.description = "Total supply of projectOne (BSC & ETH)"
    tokenData.combined.circulatingSupply.description = "Circulating supply of projectOne (BSC & ETH)"
  
    // Set names
  
    tokenData.eth.totalSupply.name = "Total Supply of projectOne on ETH"
    tokenData.bsc.totalSupply.name = "Total Supply of projectOne on BSC"
  
    tokenData.eth.circulatingSupply.name = "Circulating Supply of projectOne on ETH"
    tokenData.bsc.circulatingSupply.name = "Circulating Supply of projectOne on BSC"
  
    tokenData.combined.totalSupply.name = "Total Supply of projectOne on (BSC & ETH)"
    tokenData.combined.circulatingSupply.name = "Circulating Supply of projectOne on (BSC & ETH)"
  
     
    // Set converted and formatted value, block, and timestamp
    const tokendata_eth = tokenData.eth
    const tokendata_bsc = tokenData.bsc
    const tokendata_combined = tokenData.combined

    // Below we run through each of our tokendata objects for both chains and the combined chain data and convert or format when needed. We als add block number and date.

    Object.keys(tokendata_combined).forEach(key => {
        tokendata_combined[key].value = convert(tokendata_combined[key].value, 18)
        tokendata_combined[key].formattedValue = numeral(tokendata_combined[key].value).format()
        tokendata_combined[key].block = blockNumber
        tokendata_combined[key].bsc_block = bsc_blockNumber
        tokendata_combined[key].timestamp = Date()
    })
  
    Object.keys(tokendata_eth).forEach(key => {
      tokendata_eth[key].value = convert(tokendata_eth[key].value, 18)
      tokendata_eth[key].formattedValue = numeral(tokendata_eth[key].value).format()
      tokendata_eth[key].block = blockNumber
      tokendata_eth[key].timestamp = Date()
    })
    
    Object.keys(tokendata_bsc).forEach(key => {
      tokendata_bsc[key].value = convert(tokendata_bsc[key].value, 18)
      tokendata_bsc[key].formattedValue = numeral(tokendata_bsc[key].value).format()
      tokendata_bsc[key].block = blockNumber
      tokendata_bsc[key].timestamp = Date()
      tokendata_combined[key].bsc_block = bsc_blockNumber

    })
  
    // Finally after all data has been collected and formatted, we set up our database object and call db.updateprojectOneData() in order to cache our data in our MongoDB database.

    try {
      const client = db.getClient()
      db.updateprojectOneData(tokenData, client) 
    }
    catch(err) {
      console.log(err)
    }
  }

  module.exports = getProjectOneData