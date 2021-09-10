require('dotenv').config();
const express = require('express')
const app = express()
  .set('port', 5000)
const path = require('path');
const txChecker = require('./tx-checker');

const jsonHeaders = (req, res, next) => {
  res.header('Content-Type', 'application/json');
  next()
}

app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public'))) 

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*"); //req.headers.origin may be passed iso '*' 
  res.header('Access-Control-Allow-Headers', "Content-Type, X-Requested-With, Origin, Accept"); 
  res.header('Content-Type', '*')
  next() 
})

app.use(express.urlencoded({ 
  parameterLimit: 100000,
  limit: '50mb',
  extended : true 
}))


app.use(express.json({limit: '50mb', extended: true}))


app.get('/', (req, res) => {
    //res.sendFile('/Users/proapps/Documents/Mat/Apps/Hypeeo/web3-module/exemple/exemple.html');
    res.sendFile('/Users/proapps/Documents/Mat/Apps/Hypeeo/web3-module/public/exemple.html')
})


/**
 * @dev Transaction hash legitimacy checker (simple test check)
 * @notice `body` required with { from, to, amount }
 * @returns {object} { status, legit, result, error, reason }
 */
app.post('/txcheck', jsonHeaders, txChecker.txCheck)


/**
 * @dev Transaction hash legitimacy checker + db operations 
 * @notice Allow safe operation after onchain transaction confirmation
 * @notice `body` required with { txHash, from, to, amount }
 * @returns {object} { preHonoredTx, honoredTx, checkResult, error }
 */
app.post('/txreceiver', jsonHeaders, txChecker.txReceiver)


app.listen(app.get('port'), () => {
    console.log('Hypeeo DEVELOPMENT Server running on 5000');
});