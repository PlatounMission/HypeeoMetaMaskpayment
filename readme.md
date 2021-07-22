# WEB3 MODULE
This module has been developped for demonstration purpose only and in order to illustrate the way WEB3 needs to be initialized and used in the browser using a basic NodeJs server distribution.


## WEB3CONNECT
web3Connect is an object containing 2 function properties :

- #### web3Connect :
    - Enables web3 connection using MetaMask (prompt)
    - Injects a new web3 instance from MetaMask provided web3 (detaining the privaateKey in order for transactions to be signed)
    - Automatically propose users to add the network used by the app (testnet or mainnet) using EIP3085 feature (https://eips.ethereum.org/EIPS/eip-3085)
    - Sets network and account address change events and self-reload
    - Can receive an optional `onConnected` function parameter which is called with { address, isProd } when the user changes the network or its account address (see method doctype)
    - Returns an object { address, error } (see method doctype)

- #### transfer :
    - Checks if user has enabled web3
    - Requests the value to transfer using the `prompt` method
    - Parses the retrieved value with token decimals using the `web3.utils.toWei` method
    - Sends funds to recipient prompting MetaMask for the user to sign its transaction  
    - Alerts user with a link to the tx on the chain browser (here bscscan.com or testnet.bscscan.com)
    - Returns { error, txHash }


## INDEX.JS
index.js simply inits the DOM listeners with web3Connect methods.

## COMMANDS
Start the project using command `npm start` in a terminal located in the root folder of the project
