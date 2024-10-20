// open pay client
import { createAuthenticatedClient } from "@interledger/open-payments";
import readline from "readline/promises";

const base = "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1DNENBUUF3QlFZREsyVndCQ0lFSUt0Wmx3Tkp1UnBWcTd5Vzl1cXFDUXJ2VDd6eDd1UEJyem9MRnpQVkdWaGoKLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLQ==";
const buffer = Buffer.from(base,"base64");
const keyID = "903ca140-e205-4b6d-8ced-540d2e026c69";


(async () => {

    // creating the authentication
    const client = await createAuthenticatedClient({
        walletAddressUrl: "https://ilp.interledger-test.dev/30b77282", // the wallet address of the client that is making the payment
        privateKey: buffer, // used for the signing of the data, I provided the path of the key
        keyId: keyID, // the id that the key belongs too
        // logLevel: "debug"
    });


    const receivingWalletAddress = await client.walletAddress.get(
      {
          url: 'https://ilp.interledger-test.dev/cas-transactions' // the url of who we sending the money too
          /*
          requesting just the receiving wallets url will return:
          publicName = account holders name
          assetCode = account currency
          assetScale = decimal point, default = 2, this 1000 would be 10.00 usd if scale is 3 then it would be 1.000 usd
          authServer = the as server we need to send the grant to
          resourceServer = the rs server to send the resources to
          */
      }
    )

    const sendingWalletAddress = await client.walletAddress.get(
      {
          url: 'https://ilp.interledger-test.dev/30b77282' /* getting the name, assetCode,
        rs and as of the wallet that we sending with */
      }
    )

    console.log("receiver")
    console.log(receivingWalletAddress);

    console.log("sender")
    console.log(sendingWalletAddress);

    // 1. getting the grant from incoming payment (this happens on the service profider/ the person recieving the money)
    const incomingPaymentGrant = await client.grant.request({
          url: receivingWalletAddress.authServer,
        }, // resource one when getting the grant is the auth server

        // then we define our access token
        {
          access_token: {
            access: [
              {
                type: "incoming-payment", // type of resource. We have incoming-payment, quote, outgoing-payment
                actions: ["create"] // because we want to create the incoming payment grant
              }]},
        });

    console.log("incoming payment grant")
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

    console.log("incoming payment")
    console.log(incomingPayment)
    /**
     * The incoming payment will return a bunch things, including methods to pay the person receiving the money
     */

    // everything below here belongs to the sender

    // 3. getting grant for incoming quote, this happens on the senders side
    const quoteGrant = await client.grant.request(
        { url: sendingWalletAddress.authServer},// the auth of the sender
        {
            access_token: {
                access: [{
                      type: 'quote', // because we requesting the sender that we want to quote them
                      actions: ["create"], // creating the quote
                  }]
            }
        }
    );

    console.log("quoteGrant")
    console.log(quoteGrant)

    // 4 creating the quote
  const quote = await client.quote.create(
    // fist parameters
    {url: sendingWalletAddress.resourceServer, // the resource that we will make use of RS
      accessToken: quoteGrant.access_token.value // getting the access token
    },
    // second parameter
    {
      walletAddress: sendingWalletAddress.id,
      receiver: incomingPayment.id, // checking how much we will have to pay into the quote
      method: 'ilp', // method of payment. How the money is moved
      /*
      this request will return a field with a debit_amount that will show how much they need to pay
      based of the currency. It returns al the incoming payments as well
       */
    }
  );

  console.log("quote")
  console.log(quote)

    // 5. Get a outpayment_grant
  const outPaymentsGrant = await client.grant.request(
    {url: sendingWalletAddress.authServer}, // the person who we sedning the money too
    {
      access_token: {
        access: [{
          type: "outgoing-payment",
          actions: ["create"], // creating the payment grant, this is where the user makes the pay and money gets deducted
          limits: {debitAmount: quote.debitAmount}, // limitting how much money that can be moved for this payment
          identifier: sendingWalletAddress.id, // specifying to which use we are sending teh moeny to. Prevents the money
          // from getting lost
        }]
      },
      interact: { // because we are making a payment, we need to setup a sec paramter this
        start: ["redirect"], // e.g user gets redirected to a page where they can give consent for payment
        // this will provide you a link and that link will then be used to redirect, thrn clicking accept will redirect you to a page
      }
    }
  )

  console.log("out going payment")
  console.log(outPaymentsGrant)

  // 6. Go through user interaction
  // redirect user to outPaymentsGrand.interact.redirect.get() to give permission
  console.log("redirection url")
  console.log(outPaymentsGrant.interact.redirect)

  // asks the user to accept the outgoing payments grant request
  await readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }).question("Please accept grant and press enter...")

  // await readline.createInterface({ input: process.stdin, output: process.stdout })
  //   .question("Please accept grant and press enter...")

  // 7. continue outgoing payment grant
  // creates outgoing payment grant
  const finalisedOutgoingPaymentGrant = await client.grant.continue({
    url: outPaymentsGrant.continue.uri,
    accessToken: outPaymentsGrant.continue.access_token.value,
    });

  console.log("finalised Outgoing Payment Grant");
  console.log(finalisedOutgoingPaymentGrant)

  // 8. create outgoing payment
  const outgoingPayment = await client.outgoingPayment.create({
    url: sendingWalletAddress.resourceServer,
    accessToken: finalisedOutgoingPaymentGrant.access_token.value
  }, {
    walletAddress: sendingWalletAddress.id,
    quoteId: quote.id,
  });

  console.log("Finalised outgoing payment")
  console.log(outgoingPayment)
  console.log("Process complete ")
})();