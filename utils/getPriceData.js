const CoinGecko = require("coingecko-api");

const CoinGeckoClient = new CoinGecko();

const getPriceData = async () => {
  let priceData = await CoinGeckoClient.simple.price({
    ids: ["royale"],
    vs_currencies: ["usd"],
  });
  return priceData
}

module.exports = getPriceData