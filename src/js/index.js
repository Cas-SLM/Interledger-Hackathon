// open pay client
import { createAuthenticatedClient } from "@interledger/open-payments";

(async () => {

    // creating the authentication
    const client = await createAuthenticatedClient({
        walletAddressUrl: "https://ilp.interledger-test.dev/30b77282", // the wallet address of the client that is making the payment
        privateKey: "../keys/squad_deep.key", // used for the signing of the data, I provided the path of the key
        keyID: "31a3df0b-6833-4d39-9db2-0ee9d6a5a7a8", // the id that the key belongs too
    });


    const receivingWalletAddress = await client.receivingWalletAddress.get(
        url = "https://ilp.interledger-test.dev/cas-transactions", // the url of who we sending the money too
        /*
        requesting just the receiving wallets url will return:
        publicName = account holders name
        assetCode = account currency
        assetScale = decimal point, default = 2, this 1000 would be 10.00 usd if scale is 3 then it would be 1.000 usd
        authServer = the as server we need to send the grant to
        resourceServer = the rs server to send the resources to
        */
    )

    const sendingWalletAddress = await client.sendingWalletAddress.get(
        url = "https://ilp.interledger-test.dev/30b77282", /* getting the name, assetCode,
        rs and as of the wallet that we sending with */
    )

    console.log(receivingWalletAddress);

    // 1. getting the grant from incoming payment
    const incomingPaymentGrant = client.grant.request(
        { url: receivingWalletAddress.authServer}, // resource one when getting the grant is the auth server

        // then we define our access token
        { access_token: {
            access : [{
                type : "incoming-payment", // type of resource. We have incoming-payment, quote, outgoing-payment
                actions: ["create"], // because we want to create the incoming payment grant
            }],

        }},
    );


    console.log(incomingPaymentGrant); // the grant

    // 2. Creating an incoming payment request (this happens on the side of the person who's about to get paid)
    const incomingPayment = await client.incomingPayment.create(
        // data set one:
        // includes url of the receiving wallets RS and the access token value from the income grant
        { url: receivingWalletAddress.resourceServer, // found from requesting receiving wallet
        accessToken: incomingPaymentGrant.access_token.value}, // found in the access token from the grant

        // data set two:
        // wallet address id, the assetCode and assetScale
        {
            walletAddress: receivingWalletAddress.id,
            incomingAmount: {
                assetCode: receivingWalletAddress.assetCode, // the currency
                assetScale: receivingWalletAddress.assetScale, // the decimal point
                value: "1000", // we are sending 1000 cents. Combined with the scale 2, this will then be 10.00 usd (assetCode)
                // thus Siza will get 10.00
            },
        },
    );

    console.log(incomingPayment)
    /**
     * The incoming payment will return a bunch things, including methods to pay the person receiving the money
     */

    // 3. getting grant for incoming quote, this happens on the senders side
    const quoteGrant = await client.grant.request(
        { url: sendingWalletAddress.authServer}, the // auth of the sender
        {
            access_token: {
                [
                    {
                        type: "quote", // because we requesting the sender that we want to quote them

                    }
                ]
        }
    )

})();