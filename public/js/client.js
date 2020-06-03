///// STEP ONE: Google Autocomplete //////
var placeSearch, autocomplete, autocomplete2;
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (document.getElementById('autocomplete')), {
      types: ['geocode']
    });

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', function() {
    fillInAddress(autocomplete, "");
  });

  autocomplete2 = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (document.getElementById('autocomplete2')), {
      types: ['geocode']
    });
  autocomplete2.addListener('place_changed', function() {
    fillInAddress(autocomplete2, "2");
  });

}

function fillInAddress(autocomplete, unique) {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    if (!!document.getElementById(component + unique)) {
      document.getElementById(component + unique).value = '';
      document.getElementById(component + unique).disabled = false;
    }
  }

  // Get each component of the address from the place details
  // and fill the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType] && document.getElementById(addressType + unique)) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType + unique).textContent = val;
      var d = document.getElementById("verify" + unique);
      d.className += " is-warning";
    }
  }
    
  // SEND TO STEP TWO
  verifyAddressWithShipEngine(place);

}
google.maps.event.addDomListener(window, "load", initAutocomplete);

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}
///// END STEP ONE: Google Autocomplete //////


///// STEP TWO: Verify with ShipEngine //////
function verifyAddressWithShipEngine(data) {
    console.log('here');


    async function verifyAddress(data) {
        axios.post('/verify', data)
        .then(res => {
            console.log(res);
            console.log(res.data);
        })
        .catch(error => console.log(error));
    }

    const addressData = JSON.stringify([{"address_line1":"525 S Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"95128","country_code":"US"}]);

    verifyAddress(addressData);

    // axios({
    //     method: 'post',
    //     url: '/verify',
    //     data: data
    //   })
    // .then(res => {
    //     console.log(res);
    // })
    // .catch(error => console.log(error));
      


}
//     fetch("/verify", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//       })
//         .then(function(result) {
//           return result.json();
//         })
//         .then(function(data) {


// const addressData = JSON.stringify([{"address_line1":"525 S Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"95128","country_code":"US"}]);
// }

//     verifyAddress(addressData);

    // const verify = fetch("/verify", {
    //     method: "GET",

    //     body: JSON.stringify(data)
    //   })
    //     .then(function(result) {
    //         console.log(result);
    //     })


    // }
    // fetch("/verify", {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(data)
    //   })
    //     .then(function(result) {
    //         console.log(result);
    //       return result.json().status;
    //     })
        
    // }

    // return fetch("/verify", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(data)
    //   })
    //     .then(function(result) {
    //         console.log(result);
    //       return result.json().status;
    //     })

// }
    // const addressData = JSON.stringify([{"address_line1":"525 S Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"95128","country_code":"US"}]);


    //     (async () => {
    
    //     const response = await fetch('/verify', {
    //         method: 'post',
    //         body: addressData,
    //         headers: {'Content-Type': 'application/json'}
    //     });
    //     const json = await response.json();
    
    //     console.log(json);
    // })();


    // // const d2 = JSON.stringify(data.formatted_address);
    // // console.log(d2);

    // async function verifyAddress(data) {
    //     axios.post('https://api.shipengine.com/v1/addresses/validate', data, shipengine_config)
    //     .then(res => {
    //         // console.log(res);
    //         // console.log(res.data)
    //     })
    //     .catch(error => console.log(error));
    // }

    // const addressData = JSON.stringify([{"address_line1":"525 S Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"95128","country_code":"US"}]);
//}

    // verifyAddress(addressData);

    // res.json("hello");



    // const addressData = JSON.stringify([{"address_line1":"525 S Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"95128","country_code":"US"}]);


    // (async () => {
    
    //     const response = await fetch('/verify', {
    //         method: 'post',
    //         body: addressData,
    //         headers: {'Content-Type': 'application/json'}
    //     });
    //     const json = await response.json();
    
    //     console.log(json);
    // })();
    
    

    // console.log(data.formatted_address);

    // console.log('verify');

    // fetch("/verify", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(data)
    //   })
    //     .then(function(result) {
    //       return result.json();
    //     })


    // fetch("/verify", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify([{"address_line1":"525 S Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"95128","country_code":"US"}])
    //   })
    //     .then(function(result) {
    //       return result.json();
    //     })
    //     .then(function(data) {
    //       var elements = stripe.elements();
    //     })

    // fetch("/verify", {
    // method: "POST",
    // headers: {
    //     "Content-Type": "application/json"
    // },
    // body: JSON.stringify(data.formatted_address)
    // })
    // .then(function(result) {
    // return result.json();
    // })
    // .then(function(data) {
    // var elements = stripe.elements();
    // })

//}
///// END STEP TWO: Verify with ShipEngine //////


        // Demo toggle
        $('.demo_steps a').click(function(){
            var step = $('.demo_steps a').index(this);
            $('.step').each(function(i) {
                $(this).addClass('is-hidden',i);
                $('.step_chart li').removeClass('is-active');
            });

            if (step == 0) {
                $('.step_one').removeClass('is-hidden');
                $('.step_chart li:nth-child(1)').addClass('is-active');
            } else if (step == 1) {
                $('.step_two').removeClass('is-hidden');
                $('.step_chart li:nth-child(2)').addClass('is-active');
            } else if (step == 2) {
                $('.step_three').removeClass('is-hidden');
                $('.step_chart li:nth-child(3)').addClass('is-active');
            } else if (step == 3) {
                $('.step_four').removeClass('is-hidden');
                $('.step_chart li:nth-child(4)').addClass('is-active');
            }
            return false;
        });









// A reference to Stripe.js initialized with your real test publishable API key.
var stripe = Stripe("pk_test_0gDWcjB7xWWgt34p1UQoCxFH00CcruEzwb");

// The items the customer wants to buy
var purchase = {
  items: [{ id: "xl-tshirt" }]
};

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;
fetch("/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(purchase)
})
  .then(function(result) {
    return result.json();
  })
  .then(function(data) {
    var elements = stripe.elements();

    var style = {
      base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        fontFamily: 'Arial, sans-serif',
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    };

    var card = elements.create("card", { style: style });
    // Stripe injects an iframe into the DOM
    card.mount("#card-element");

    card.on("change", function (event) {
      // Disable the Pay button if there are no card details in the Element
      document.querySelector("button").disabled = event.empty;
      document.querySelector("#card-errors").textContent = event.error ? event.error.message : "";
    });

    var form = document.getElementById("payment-form");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      // Complete payment when the submit button is clicked
      payWithCard(stripe, card, data.clientSecret);
    });
  });

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
var payWithCard = function(stripe, card, clientSecret) {
  loading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then(function(result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeeded!
        orderComplete(result.paymentIntent.id);
      }
    });
};

/* ------- UI helpers ------- */

// Shows a success message when the payment is complete
var orderComplete = function(paymentIntentId) {
  loading(false);
  document
    .querySelector(".result-message a")
    .setAttribute(
      "href",
      "https://dashboard.stripe.com/test/payments/" + paymentIntentId
    );
  document.querySelector(".result-message").classList.remove("hidden");
  document.querySelector("button").disabled = true;
};

// Show the customer the error from Stripe if their card fails to charge
var showError = function(errorMsgText) {
  loading(false);
  var errorMsg = document.querySelector("#card-errors");
  errorMsg.textContent = errorMsgText;
  setTimeout(function() {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
var loading = function(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};
