



//////////////////////////////////////////
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

  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (document.getElementById('autocomplete')), {
      types: ['geocode']
    });


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
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    if (!!document.getElementById(component + unique)) {
      document.getElementById(component + unique).value = '';
      document.getElementById(component + unique).disabled = false;
    }
  }

  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType] && document.getElementById(addressType + unique)) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType + unique).textContent = val;
    }
  }
  const statusButton = document.getElementById("verify" + unique);

  verifyAddressWithShipEngine(place, statusButton, unique);
}
google.maps.event.addDomListener(window, "load", initAutocomplete);

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    //   var circle = new google.maps.Circle({
    //     center: geolocation,
    //     radius: position.coords.accuracy
    //   });
      //autocomplete.setBounds(circle.getBounds());
    });
  }
}
///// END STEP ONE: Google Autocomplete //////
/////////////////////////////////////////////

/////////////////////////////////////////////
///// STEP TWO: Verify with ShipEngine //////
function verifyAddressWithShipEngine(data, statusButton, unique) {
    const addressData = [];
    var store = false;
    var obj = {};

    ///// STEP TWO (A): Clean //////
    for (var i = 0; i < data.address_components.length; i++) {
        var addressType = data.address_components[i].types[0];
        var val = data.address_components[i].short_name;

        // SHIPENGINE ADDRESS FORMAT
        // [{"address_line1":"Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"78756","country_code":"US"}]

        // store street number and route into address_line1
        if (addressType == "street_number") {
            streetNumber = val;
            var store = false;
            continue;
        }
        if (addressType == "route") {
            addressType = "address_line1";
            val = streetNumber + " " + val;
        }
        if (addressType == "locality") { addressType = "city_locality" };
        if (addressType == "administrative_area_level_1") { addressType = "state_province" };
        // Translating and hardcoding US 
        if (addressType == "country") { addressType = "country_code";val = "US"; };
            
        var store = true;

        if (store == true) {
            obj[addressType] = val;
        }

    }
    addressData.push(obj); 

    // Name is assocaited with Address for ShipEngine  
    if (unique != 2) {
       obj["name"] = $('#my_name').val();
    } else {
        obj["name"] = $('#rep_name').val();
    }
    // adding a placeholder because we don't ask for phone number
    obj["phone"] = "111-111-1111";
    // adding a placeholder because we don't ask for phone number

    const addressDataFormat = JSON.stringify(addressData);
    console.log(addressDataFormat);

    // Reset button status while verifing
    statusButton.className = "tag verify is-warning"
    statusButton.innerHTML = '<i class="fas fa-cog fa-spin"></i>Verifying via ShipEngine';

    ///// STEP TWO (B): Check with SHIPENGINE -> router.post('/verify') //////
    fetch("/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: addressDataFormat
      })
      .then(function(response) {
        return response.json();
      }).then(function(data) {
        // console.log(data); 
        
        // Check Satus
        if (data[0].status) {
            var status = data[0].status;
            if (status == "verified") {
                statusButton.className = "tag verify is-success";
                statusButton.innerHTML = "Verified by ShipEngine!";

                var whichUnique = "address" + unique;
                localStorage.setItem(whichUnique, addressDataFormat);

                if ($("#verify2").hasClass('is-success') && $("#verify").hasClass('is-success')) {
                    $('#goToStep3').removeAttr("disabled").removeClass('is-inactive').addClass('is-success');
                }

            } 
            else if (status == "unverified") {
                statusButton.innerHTML = "Could not verify address";
            }
            else if (status == "warning") {
                statusButton.className += " is-danger";
                statusButton.innerHTML = "Error with Address! Please try again.";
            }
            else if (status == "error") {
                statusButton.className += " is-danger";
                statusButton.innerHTML = "Error with Address! Please try again.";
            }
        };
    });
    

}
///// END STEP TWO: Verify with ShipEngine //////
/////////////////////////////////////////////


$('#goToStep2').click(function(){
    $('.container').removeClass('step0 step1 step2 step3');
    $('.container').addClass('step1');
    $('.step_one').addClass('is-hidden');
    $('.step_two').removeClass('is-hidden');
});

$("#step_two_form").submit(function(e) {

    e.preventDefault();

    // AJM Add form check here....
    var rate_options = '"rate_options":{"carrier_ids":["se-253580"]}';

    // AJM - is this the best way to parse this? ¯\_(ツ)_/¯
    var ship_to = JSON.parse(localStorage.getItem("address2"))[0];
    var ship_from = JSON.parse(localStorage.getItem("address"))[0];
    
    // Calculate weight
    var lbs = $('#weight_lb').val();
    var oz = $('#weight_oz').val();
    var totalWeight = (lbs * 16) + oz;

    // Calculate size
    var size_length = $('#size_length').val();
    var size_width = $('#size_width').val();
    var size_height = $('#size_height').val();

    var someData =
        {
            // AJM TO DO - harcoding - move to var
            rate_options: {"carrier_ids":["se-253580"]},
            shipment: {
                validate_address:"no_validation",
                ship_to: ship_to, 
                ship_from: ship_from,
                packages: [{"weight":{"value":totalWeight,"unit":"ounce"},"dimensions":{"unit":"inch","length":size_length,"width":size_width,"height":size_height}}]
            }
        };

     var package = JSON.stringify(someData)
     estimate(package);
    
});


function estimate(someData) {
    // Slide Rate Chart down
    $('.rate_list').animate({top:0}, 800);
    
    fetch("/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: someData
      })
      .then(function(response) {
        return response.json();
      }).then(function(data) {
        console.log(data);

        // Extract the first rate as a default - AJM Best way to do this? ¯\_(ツ)_/¯
        console.log(data.rate_response.rates[0]);
        console.log(data.rate_response.rates[0].shipping_amount.amount);
        var rate = data.rate_response.rates[0].shipping_amount.amount;
        

        pay(rate);

        // Run with rate data
        $('.rate span').text('$'+rate);
        
        // Clear old shipping info
        $('.rate_list').html("");
        $(data.rate_response.rates).each(function() { 
            console.log(this);
            $('.rate_list').append('<a id="' + this.rate_id + '"><strong>' + this.service_type + '</strong>'+ ' ' + this.package_type + '<span>$'+this.shipping_amount.amount+'</span></a>');
        });
      });
}  

// Action: Rate Selection
$('.rate_list a').click(function(){
    // Slide up
    var topPos = "-100%";
    $('.rate_list').animate({top:topPos}, 800);
    
    // Store ID [ID not price to prevent hack]
    var grabId = $(this).attr('id');
    var price = $(this).child('span').text();

    console.log(price);
    localStorage.setItem(newRate, grabId);
    
    // Change Price Tag
    $('.rate span').text(price);
});



// Demo toggle
$('.demo_steps a').click(function(){
    var step = $('.demo_steps a').index(this);
    $('.step').each(function(i) {
        $(this).addClass('is-hidden',i);
        $('.step_chart li').removeClass('is-active');
    });
    $('.container').removeClass('step0 step1 step2 step3');
    $('.container').addClass('step' + step);


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
// var purchase = {
//   items: [{ id: "xl-tshirt" }]
// };

// Disable the button until we have Stripe set up on the page
// document.querySelector("button").disabled = true;
function pay(storedRate) {
    console.log("i am pay func");
    console.log(storedRate);

    fetch("/create-payment-intent", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: storedRate
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


}
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
        //   document
        //     .querySelector(".result-message a")
        //     .setAttribute(
        //       "href",
        //       "https://dashboard.stripe.com/test/payments/" + paymentIntentId
        //     );
        $('.result-message').removeClass("is-hidden");
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
        } else {
            document.querySelector("button").disabled = false;
        }
        };