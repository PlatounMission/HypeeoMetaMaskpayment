const { NETWORK } = process.env;    // `bsc` (production) or `bsctest` (development)
const Web3 = require('web3');
const {bnbPrice} = require('./coin-gecko');
const db = require('./db');
const web3providers = {
    bsc: 'https://bsc-dataseed1.binance.org:443',
    bsctest: 'https://data-seed-prebsc-1-s1.binance.org:8545'
}

const assert = async(condition, msg, status) => {
    if (!condition) throw({msg, status: status || 400})
    else return true;
} 


/**
 * @dev Check if an address A has sent a specific amount to an address B from a transaction hash
 * @param {object} checkParams request object MUST contain a `body` object property
 * @prop {string} checkParams.txHash evm transaction hash
 * @prop {string} checkParams.from evm address of the sender
 * @prop {string} checkParams.to evm address of the receiver
 * @prop {string} checkParams.amount amount that must have been transfered from provided `from` address to `to` address
 * @returns {object} 
 *  { 
 *      from, (the provided "from" address)
 *      to, (the provided "to" address)
 *      amount, (the provided amount that must match tx "value")
 *      txHash, (the provided tx hash)
 *      status, (number, 200 if legit)
 *      error, (any error occuring)
 *      reason, (any error reason)
 *      result, (transaction object if found, else empty object)
 *      legit (boolean indicating that the evm transaction matches the expected and provided `checkParams`)
 * }
 */
const txChecker = async({
    txHash,
    from,
    to,
    amount
}) => {

    try {
        await assert(txHash, 'missing `txHash` parameter to fulfill the request');
        await assert(from, 'missing `from` parameter to fulfill the request');
        await assert(to, 'missing `to` parameter to fulfill the request');
        await assert(amount, 'missing `amount` parameter to fulfill the request');

        const lcFrom = await Promise.resolve(from.toLowerCase());
        const lcTo = await Promise.resolve(to.toLowerCase());

        const web3 = new Web3(web3providers[NETWORK]);

        const result = await web3.eth.getTransaction(txHash)
        await assert(result, 'An error occured while retrieving transaction data', 404);
        await assert(result?.from.toLowerCase() === lcFrom, `This transaction has not been sent by the provided 'from' address ${from}`);
        await assert(result?.to.toLowerCase() === lcTo, `The receiver of this transaction is not the provided 'to' address ${to}`);
        await assert(result?.value === amount.toString(), `The value of this transaction doesn't match the provided value for 'amount' ${amount}`);
        await assert(result?.gas >= 21000, `This transaction has not assertd any gas and therefore is not legit`);

        return({ status: 200, legit: true, result });

    }
    catch(error) {
        return({error: true, reason: error?.msg || error, status: error?.status || 500, result: {}, legit: false});
    }

}

module.exports.txCheck = async(req, res) => {
  
    const check = await txChecker(req?.body || {});
    res.status(200).send(check);
  
}

module.exports.txReceiver = async(req, res) => {
    const minimumBnbUsdPrice = 300;

    const checkResult = await txChecker(req?.body);
    if (checkResult?.legit === true) {
      
      // internally check that this exact transaction has not been honored yet
      const preHonoredTxs = await db.get('honored-txs', {});
      const preHonoredTx = await Promise.resolve(
        Object.keys(preHonoredTxs).find((hash) => preHonoredTxs[hash] )
      );

      
  
      // reject if transaction has already been honored
      if (preHonoredTx && preHonoredTx.toString() !== 'undefined') 
        res.send({ preHonoredTx: true, honoredTx: false, error: 'this transaction has already been honored', checkResult});
      
      else {
        const { usd, last_updated_at } = await bnbPrice();
        const updateTime = last_updated_at * 1000;

        console.log(`
        - 1 BNB WORTH $${usd} 
        - last update : ${new Date(updateTime)})`
        );
        /// @todo realize any operation from transaction at this point...

        const conditionFulfilled = await Promise.resolve((usd >= minimumBnbUsdPrice));

        // internally set this exact transaction as honored 
        const honoredTx = (
          conditionFulfilled
          && await db.merge('honored-txs', { [checkResult.result.hash]: true })
        );

        console.log('honoredTx', {honoredTx: conditionFulfilled, condition: usd >= minimumBnbUsdPrice});
  
        // acknowledge legitimacy of the transaction
        res.status(200).send({ preHonored: false, honoredTx, checkResult });
      }
    } else res.send({checkResult, honoredTx: false, preHonoredTx: false});
  
  }