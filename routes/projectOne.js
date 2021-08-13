const express = require('express')
const sleep = require('ko-sleep');
const app = express.Router()
 

app.get('/', (req, res) => {
  res.json(req.chainData)
})

app.get('/combined', (req, res) => {
  res.json(req.chainData.combined)
})

app.get('/eth', (req, res) => {
  res.json(req.chainData.eth)
})

app.get('/bsc', (req, res) => {
  res.json(req.chainData.bsc)
})


app.get('/combined/circulating/details', (req, res) => {
  res.json(req.chainData.combined.circulatingSupply)
})

app.get('/combined/circulating/', (req, res) => {
  res.json(req.chainData.combined.circulatingSupply.value)
})

app.get('/combined/total/details', (req, res) => {
  res.json(req.chainData.combined.totalSupply)
})

app.get('/combined/total', (req, res) => {
  res.json(req.chainData.combined.totalSupply.value)
})


app.get('/eth/circulating/details', (req, res) => {
  res.json(req.chainData.eth.circulatingSupply)
})

app.get('/eth/total/details', (req, res) => {
  res.json(req.chainData.eth.totalSupply)
})


app.get('/circulating', (req, res) => {
  res.json(req.chainData.combined.circulatingSupply.value)
})

app.get('/total', (req, res) => {
  res.json(req.chainData.combined.totalSupply.value)
})

app.get('/eth/circulating', (req, res) => {
  res.json(req.chainData.eth.circulatingSupply.value)
})

app.get('/eth/total', (req, res) => {
  res.json(req.chainData.eth.totalSupply.value)
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