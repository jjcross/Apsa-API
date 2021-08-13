const addresses = require("../addresses/projectTwo")
const projectTwoAbi = require("../abi/projectTwoAbi.json")
const numeral = require("numeral")
const db = require("./db")

const getProjectTwoData = async (web3s) => {
    const {bsc_web3} = web3s
    const bsc_blockNumber = await bsc_web3.eth.getBlockNumber() 
    const {projectTwo_addresses} = addresses

    // Set number formatting default
    numeral.defaultFormat("0,0");
  

    // Instantiate all smart contract object(s)
    let projectTwo = new bsc_web3.eth.Contract(projectTwoAbi, projectTwo_addresses.contract)
    
    // For converting to proper number of decimals
    const convert = (num, decimal) => {
      return Math.round((num / (10*10**(decimal-3))))/100
    }

    // Make tokenData object

    let tokenData = {
      bsc: {
          totalSupply: {value: 0},
          circulatingSupply: {value: 0},
      }
    }
  

    // Get base values 
    tokenData.bsc.totalSupply.value = await projectTwo.methods.totalSupply().call()

    let team_tokens = 0
    
    for (const account of projectTwo_addresses.team_accounts) {
      let balance = await projectTwo.methods.balanceOf(account).call() 
      team_tokens += Number(balance)
    }

    // Circulating supply
    tokenData.bsc.circulatingSupply.value = tokenData.bsc.totalSupply.value - team_tokens

    // Set up descriptions
    tokenData.bsc.totalSupply.description = "Total supply of Greenheart projectTwo on BSC"
  
    tokenData.bsc.circulatingSupply.description = "Circulating supply of Greenheart projectTwo on BSC"
  
  
    // Set names
  
    tokenData.bsc.totalSupply.name = "Total Supply BSC"
  
    tokenData.bsc.circulatingSupply.name = "Circulating Supply BSC"
  
     
    // Set converted and formatted value, block, and timestamp
    const tokendata_bsc = tokenData.bsc

    Object.keys(tokendata_bsc).forEach(key => {
      tokendata_bsc[key].value = convert(tokendata_bsc[key].value, 18)
      tokendata_bsc[key].formattedValue = numeral(tokendata_bsc[key].value).format()
      tokendata_bsc[key].block = bsc_blockNumber
      tokendata_bsc[key].timestamp = Date()
    })
  
    
    try {
      const client = db.getClient()
      db.updateprojectTwoData(tokenData, client) 
    }
    catch(err) {
      console.log(err)
    }
  }

  module.exports = getProjectTwoData