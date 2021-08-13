const express = require('express')
const app = express.Router()


app.get('/', (req, res) => {
  res.json(req.chainData)
})

app.get('/bsc', (req, res) => {
  res.json(req.chainData.bsc)
})


app.get('/bsc/total', (req, res) => {
  res.json(req.chainData.bsc.totalSupply.value)
})

app.get('/bsc/circulating', (req, res) => {
  res.json(req.chainData.bsc.circulatingSupply.value)
})


app.get('/bsc/total/details', (req, res) => {
  res.json(req.chainData.bsc.totalSupply)
})
 
app.get('/bsc/circulating/details', (req, res) => {
  res.json(req.chainData.bsc.circulatingSupply)
})

module.exports = app