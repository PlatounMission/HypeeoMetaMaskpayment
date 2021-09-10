const APP_NETWORK = 97;
/**
 * @dev Data required by EIP3085 
 * @dev Allow adding a particular network to users wallets
 * @see https://eips.ethereum.org/EIPS/eip-3085
 */
const EIP3085Data = {
    // BSC MAIN
    '56' : {
      chainId: '0x38',
      chainName: 'Binance Smart Chain',
      nativeCurrency:
          {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
          },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com/'],
    },
    // BSC TEST
    '97' : {
      chainId: '0x61',
      chainName: 'Binance Smart Chain - Test',
      nativeCurrency:
          {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
          },
      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
      blockExplorerUrls: ['https://testnet.bscscan.com'],
    },

}



/**
 * @dev Enable Web3 with current provider and set listeners 
 * @dev uses EIP3085 to add BSC network to user's wallet
 * @param {function} onConnected *optional* Method called when web3 has been initialized and client is connected to the dApp (auto-reload feature base)
 * 
 * @dev Sets events listeners for : 
 *  - Network changes
 *  - Account address changes
 * 
 * @returns {object} {
 *  address: Eth address of the client
 *  error: Any error occuring while connecting client
 * }
 * 
 */
const web3Connect = async(onConnected) => {
    // Modern dapp browsers...
    if (typeof window.ethereum !== "undefined") {
       
        try {

            // Prompt Metamask to connect the user if needed
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            // user address in use has index 0
            const address = accounts[0];
            // inject MetaMask provided web3 within main window (in order to use its `utils` methods later on)
            window.web3 = new Web3(window.ethereum);  

            // check that user is connected on BSC...
            if (window.ethereum.networkVersion.toString() !== APP_NETWORK.toString()) {
                // ... if not, propose to add the network currently used by the app (BSC testnet or mainnet) using EIP3085
                await window.ethereum
                    .request({
                        method: 'wallet_addEthereumChain',
                        params: [ EIP3085Data[APP_NETWORK] ]
                    })
                    .catch();

            }

            // Events
            window.ethereum?.on('accountsChanged', (accounts) => {
                // Time to reload your interface with accounts[0]!
                // the `chainId` prop can be retrieved with `window.ethereum.networkVersion`
                web3Connect(onConnected);
            })
            
            window.ethereum?.on('chainChanged', (networkId) => {
                // Time to reload your interface with the new networkId
                web3Connect(onConnected);
            });

            // If provided, call the `onConnected` function argument with { address, isProd }
            typeof onConnected === 'function'
                && onConnected({
                    address,
                    isProd: APP_NETWORK.toString() === '56'
                });

            // module returns address
            return {
                address, 
            };

            
        } catch (error) {
            // User denied account access... 
            console.error('*** [web3Connect] User denied account access or any other error occured while enabling web3', error);
            return {
                error
            }

        }
    }
    
    // Legacy dapp browsers...
    else if (window.web3) {

        window.web3 = new Web3(window.web3.currentProvider); 

        return({
            address: window.web3.coinbase
        });   
    }
    
    // Non-dapp browsers...
    else {
        return({error: 'Non-Ethereum browser detected. You should consider trying MetaMask!'})
    }

}


/**
 * @notice Transfer current chain token from address A to address B
 * @dev the `value` is prompted to user
 * @param {string} from wallet address sending the value
 * @param {stirng} to wallet address receiving the value
 * @returns {object} {error, txHash}
 */
const transfer = async(from, to) => {
    if (!from) window.alert('Please connect first')

    else try {
      const value = await Promise.resolve(
        window.prompt('Ether amount to transfer as donation :')
      );
      console.log('TRANSFERRING', value, 'BNB, from', from, 'to', to);

    const parsedValue = parseInt(window.web3.utils.toWei(value,"ether")).toString(16);//await Promise.resolve((parseFloat(value.replace(',', '.')) * 1e18).toString());
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to,
            from,
            // here we need to add the decimals of the token, in your case yout are dealing with native BNB, so we know it's 18 decimals by default, let's use that
            value: parsedValue,
          },
        ],
      });

      console.log('txHash', txHash);

      // todo : API CHECK post /txreceiver here...

      return {error: !txHash, txHash}
      
    }catch(e) {
      console.error('Transaction failed:', e);
      window.alert('Transaction has failed');
    }
  }
  
