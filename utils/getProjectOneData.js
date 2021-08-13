const addresses = require("../addresses/projectOne")
const projectOneAbi = require("../abi/projectOneAbi.json")
const numeral = require("numeral")
const db = require("./db")

const getprojectOneData = async (web3s) => {
    const {web3, bsc_web3} = web3s
    
    const blockNumber = await web3.eth.getBlockNumber()
    let bsc_blockNumber
    try {
        bsc_blockNumber = await bsc_web3.eth.getBlockNumber() 
    }
    catch(err) {
        bsc_blockNumber = 0
        console.log("CANT GET bsc_blockNumber")
        console.log(err)
    }
    const {eth_addresses, bsc_addresses} = addresses
    // Set number formatting default
    numeral.defaultFormat("0,0");
  

    // Instantiate all smart contract object(s)
    let projectOne = new web3.eth.Contract(projectOneAbi, eth_addresses.contract)
    let bsc_projectOne
    try {
        bsc_projectOne = new bsc_web3.eth.Contract(projectOneAbi, bsc_addresses.contract)
    }
    catch(err) {
        console.log("couldn't connect to BSC")
        console.log(err)
    }
    
    // For converting to proper number of decimals
    const convert = (num, decimal) => {
        return Math.round((num / (10*10**(decimal-3))))/100
     }

    // Make tokenData object

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
  
    //!!!!!!!!---------REFACTOR----------!!!!!! 
    

    
    try {
      const client = db.getClient()
      db.updateprojectOneData(tokenData, client) 
    }
    catch(err) {
      console.log(err)
    }
    return tokenData
  }

  module.exports = getprojectOneData