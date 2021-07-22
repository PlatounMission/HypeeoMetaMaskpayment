
window.onload = (() => {
    const $connect = document.querySelector('#connect-button');
    const $clientAddress = document.querySelector('#client-address');
    const $trfRecipient = document.querySelector('#trf-recipient');
    const $trfButton = document.querySelector('#trf-button');
    const $txHashLink = document.querySelector('#tx-hash-link');
    const $txHash = document.querySelector('#tx-hash');
    
    // used to display url to bscscan main or test network
    let isProd;
    let globalAddress;

    $connect.addEventListener('click', async() => {
        const {
            address,
            error
        } = await web3Connect(({ address, isProd: _isProd }) => {
            isProd = _isProd;
            $clientAddress.innerHTML = address.toString();
        })

        globalAddress = address;

        if (error) {

            // client is not connected for some reason
            console.error("❌ CAN'T CONNECT TO WEB3 and/or NETWORK", error);

        }
        else {

            // client is connected
            console.log('✅ CLIENT IS CONNECTED TO BSC WITH ADDRESS', address);

        }
    })

    $trfButton.addEventListener('click', async() => {
        const recipient = $trfRecipient.value

        const {
            error,
            txHash
        } = await transfer(globalAddress, recipient);

        if (error) {

            // Transfer error
            console.error("❌ TRANSFER ERROR", error);

        }
        else {

            // Transfer success
            console.log('✅ TRF txHash', txHash);
            
            const txUrl = await Promise.resolve(
                `https://${isProd ? '' : 'testnet.'}bscscan.com/tx/${txHash}`
            );

            $txHash.innerHTML = txUrl;
            $txHashLink.setAttribute('href', txUrl);

        }
    })
})