const tokenData = require("./getChainData")
const sleep = require('ko-sleep');

const getReady = async () => {
  while (true) {
    if (tokenData.block) {
      break;
    }
    await sleep(100);
  }
  return true
}

module.exports = getReady

