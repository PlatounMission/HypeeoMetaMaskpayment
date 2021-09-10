const { default: axios } = require('axios');

/*****************************
 * Coin Gecko api fetcher
 * api url : https://api.coingecko.com/api/v3/simple/token_price
*****************************/
                    
/**
 * @dev Returns market datas for BNB
 * @notice only supported network for now is : BSC
 * @param {string} _currency *optional* coin gecko approved currency (default: 'usd') @see https://www.coingecko.com/api/documentations/v3#/
 * @returns {object} { usd, last_updated_at }
 */
module.exports.bnbPrice = async(_currency) => {
    try {
        const currency = await Promise.resolve(
            _currency || 'usd'
        )
        
        const url = await Promise.resolve(
            `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=${currency}&include_last_updated_at=true`
        );
        
        const { data } = await axios.get(url);
        console.log('coin-gecko api axiosResponse.data', data);
        
        const _bnbPrice = await Promise.resolve(
            data?.binancecoin   // { usd, last_updated_at }
        )

        return _bnbPrice;
    }catch(e) {
        console.error('\n[error]\n ERROR WHILE RETRIEVING COIN GECKO BNB PRICE :', e?.response?.statusText || e);
        return {error: e?.response?.statusText || e}
    }
    
}