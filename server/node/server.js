/**
 * server.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet)
 * and Thorsten Schaeff (@thorwebdev).
 *
 * This is the main file starting the Express server for the demo and enabling ngrok.
 */

'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ngrok = config.ngrok.enabled ? require('ngrok') : null;
const app = express();
const stripe = require("stripe")("sk_test_5o0vN0SGJmo9fL27syITwDYC00v7Ly5D4h");
const opn = require('opn');
const { read } = require('fs');

// Setup useful middleware.
app.use(
  bodyParser.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../../public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Define routes.
app.use('/', require('./routes'));
app.use(express.static("."));
app.use(express.json());


function calculateOrderAmount(rate) {
    // Because Stripe likes numbers without decimals.
    const converRate = (rate / 100).toFixed(4);
    const convertedCost = parseInt(converRate.toString().replace(".", ""), 10);
    return convertedCost;
}

app.post("/create-payment-intent", async (req, res) => {
    const rate = req.body.rate;
    const convertedCost = calculateOrderAmount(rate);

    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: convertedCost,
        currency: "usd"
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

// Start the server on the correct port.
const server = app.listen(config.port, () => {
  console.log(`🚀🚀🚀🚀  Server listening on port ${server.address().port}`);
});

// Turn on the ngrok tunneverifyl in development, which provides both the mandatory HTTPS
// support for all card payments, and the ability to consume webhooks locally.
if (ngrok) {
  ngrok
    .connect({
      addr: config.ngrok.port,
      subdomain: config.ngrok.subdomain,
      authtoken: config.ngrok.authtoken,
    })
    .then(url => {
      console.log(`App URL to see the demo in your browser: ${url}/`);
      opn(url);
      //opn(url+ '/verify');
    })
    .catch(err => {
      if (err.code === 'ECONNREFUSED') {
        console.log(`⚠️  Connection refused at ${err.address}:${err.port}`);
      } else {
        console.log(`⚠️ Ngrok error: ${JSON.stringify(err)}`);
      }
      process.exit(1);
    });
}
