const offerData = {
  "recommended_offers": [
    {
      "id": "29328",
      "headline": "Earn 2.0% cash back when you shop at 7 For All Mankind", 
      "reward_type": "PERCENTAGE",
      "reward_rate": 2,
      "reward_value": null,
      "merchant_name": "7 For All Mankind",
      "merchant_logo_url": "https://d34ye2dnwzj2t5.cloudfront.net/2fjnmivgtbagncfgx4towhr2pu.png",
      "merchant_url": "https://www.groceriesrus.com"
    },
    {
      "id": "29563",
      "headline": "Earn 1.0% cash back when you shop at Scuba.com",
      "reward_type": "PERCENTAGE",
      "reward_rate": null,
      "reward_value": 1.0,
      "merchant_name": "Scuba.com",
      "merchant_logo_url": "https://d34ye2dnwzj2t5.cloudfront.net/btpwdeu5xrbrppo762ehae74we.png",
      "merchant_url": "https://www.thecoffeespot.com"
    },
    {
      "id": "29339",
      "headline": "Earn 5.0% cash back when you shop at West Path",
      "reward_type": "PERCENTAGE",
      "reward_rate": null,
      "reward_value": 5.0,
      "merchant_name": "West Path",
      "merchant_logo_url": "https://d34ye2dnwzj2t5.cloudfront.net/x477aw42avex5jtbypuce2riom.png",
      "merchant_url": "https://www.thecoffeespot.com"
    },
        {
      "id": "29756",
      "headline": "Earn 3.5% cash back when you shop at KimmyShop.com", 
      "reward_type": "PERCENTAGE",
      "reward_rate": 3.5,
      "reward_value": null,
      "merchant_name": "KimmyShop.com",
      "merchant_logo_url": "https://d34ye2dnwzj2t5.cloudfront.net/4p734spcqbecvmh7od67atunpu.jpg",
      "merchant_url": "https://www.groceriesrus.com"
    },
    {
      "id": "29725",
      "headline": "Earn 3.5% cash back when you shop at P.J. Salvage",
      "reward_type": "PERCENTAGE",
      "reward_rate": null,
      "reward_value": 3.5,
      "merchant_name": "P.J. Salvage",
      "merchant_logo_url": "https://d34ye2dnwzj2t5.cloudfront.net/4szrzk4jsfhoxlyzmq3ds6hfku.jpg",
      "merchant_url": "https://www.thecoffeespot.com"
    },
    {
      "id": "29666",
      "headline": "Earn $20.00 cash back when you shop at Boost Your Score",
      "reward_type": "FIXED",
      "reward_rate": null,
      "reward_value": 20.0,
      "merchant_name": "Boost Your Score",
      "merchant_logo_url": "https://d34ye2dnwzj2t5.cloudfront.net/hg3nyhgwwnbafgmllcaotica2q.png",
      "merchant_url": "https://www.thecoffeespot.com"
    },
        {
      "id": "31700",
      "headline": "Earn 5.0% cash back when you shop at Trust & Will",
      "reward_type": "PERCENTAGE",
      "reward_rate": null,
      "reward_value": 5.0,
      "merchant_name": "Trust & Will",
      "merchant_logo_url": "https://d34ye2dnwzj2t5.cloudfront.net/qluemeg37rb5vep6dstr3ombzm.jpg",
      "merchant_url": "https://www.thecoffeespot.com"
    }
  ]
};

window.TripleLite = (function () {
    // Private function to create and store a UUID for the current user
    function generateUUID() {
        // Generate a UUID using a simple method (not RFC4122 compliant)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getOrGenerateUUID() {
        let uuid = localStorage.getItem('userUUID');
        if (!uuid) {
            uuid = generateUUID();
            localStorage.setItem('userUUID', uuid);
        }
        return uuid;
    }

    function getDomain() {
        var hostname = window.location.hostname;
        var parts = hostname.split('.').reverse();

        if (parts.length >= 2) {
            // Most common case: domain.com
            return parts[1] + '.' + parts[0];
        } else if (parts.length === 1) {
            // Localhost or similar single-part hostname
            return parts[0];
        } else {
            // This is an unusual case (e.g., no hostname or IP address)
            return '';
        }
    }

    // Private function to get the user geolocation based on the browser IP address
    function getGeoLocation(callback) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                console.log(location);
                callback(null, location);
            }, function (error) {
                callback(error, null);
            });
        } else {
            callback(new Error("Geolocation is not supported by this browser."), null);
        }
    }

    // Private function to render offers on the webpage
    function renderOffers(recommended_offers, apiKey, clientId) {
        offers = recommended_offers.recommended_offers;
        cardHolderId = localStorage.getItem('cardAccountId');

        var container = document.getElementById('triple-lite-container');
        if (!container) {
            console.error('Triple Lite Widget error: Container element not found.');
            container = document.getElementById('hero');
            //return;
        }

        // Create a row
        var row = document.createElement('div');
        row.className = 'triple-lite-row';

        offers.forEach(function (offer) {
            // Create column for each card
            var col = document.createElement('div');
            col.className = 'col'; // Could be changed in the future (e.g., 'col-md-4' for three cards per row)

            // Create a Card Flip Container
            var cardFlip = document.createElement('div');
            cardFlip.className = 'triple-lite-card-flip';

            // Card Flip Inner Container
            var cardFlipInner = document.createElement('div');
            cardFlipInner.className = 'triple-lite-card-flip-inner';

            // Toggle flip class on click
            cardFlip.addEventListener('click', function () {
                this.classList.toggle('flip');
            });

            // Overlay
            var overlay = document.createElement('div');
            overlay.className = 'triple-lite-card-overlay';
            cardFlip.appendChild(overlay); // Add overlay to the cardFlip container

            // Card Front
            var cardFront = document.createElement('div');
            cardFront.className = 'triple-lite-card-front';

            // Create an image wrapper
            var imageWrapper = document.createElement('div');
            imageWrapper.className = 'triple-lite-img-wrapper';

            // Add image inside the wrapper
            if (offer.merchant_logo_url) {
                var img = document.createElement('img');
                img.className = 'triple-lite-img';
                img.src = offer.merchant_logo_url;
                img.alt = offer.merchant_name;
                imageWrapper.appendChild(img);
            }

            // Append the img to the Card Front
            cardFront.appendChild(imageWrapper);

            // Add headline
            if (offer.headline) {
                if (offer.reward_type === 'PERCENTAGE') {
                    var headline = document.createElement('h6');
                    headline.className = 'card-title triple-lite-headline';
                    headline.textContent = offer.reward_rate + '% cash back';
                    cardFront.appendChild(headline);
                }
                if (offer.reward_type === 'FIXED') {
                    var headline = document.createElement('h6');
                    headline.className = 'card-title triple-lite-headline';
                    headline.textContent = '$' + offer.reward_value + ' cash back';
                    cardFront.appendChild(headline);
                }
            }

            // Add merchant name
            if (offer.merchant_name) {
                var merchantName = document.createElement('p');
                merchantName.className = 'card-text triple-lite-merchant-name';
                merchantName.textContent = offer.merchant_name;
                cardFront.appendChild(merchantName);
            }

            // Card Back
            var cardBack = document.createElement('div');
            cardBack.className = 'triple-lite-card-back';

            // Add headline
            if (offer.headline) {
                var fullHeadline = document.createElement('p');
                fullHeadline.className = 'card-text triple-lite-full-headline triple-lite-paragraph';
                fullHeadline.textContent = offer.headline;
                cardBack.appendChild(fullHeadline);
            }

            // Add a button to visit the merchant
            var visitButton = document.createElement('a');
            visitButton.className = 'triple-lite-visit-btn';
            visitButton.href = offer.merchant_url; // Assuming 'merchant_url' is the property with the URL
            visitButton.textContent = 'Visit Merchant';
            visitButton.target = '_blank'; // Opens the link in a new tab
            cardBack.appendChild(visitButton);

            // Add a link to view the offer details
            var detailsLink = document.createElement('a');
            detailsLink.className = 'triple-lite-details-link';
            detailsLink.target = '_blank';
            detailsLink.href = 'https://triple-lite-mvp.web.app/offer-details.html?offerId=' + offer.id + '&apiKey=' + apiKey + '&clientId=' + clientId;
            detailsLink.textContent = 'View Details';
            //detailsLink.onclick = function () { openModal(offer.id) };
            cardBack.appendChild(detailsLink);

            // Heart Icon Button
            var heartButton = document.createElement('button');
            heartButton.className = 'triple-lite-icon-btn triple-lite-heart-btn';
            heartButton.innerHTML = '&#x2665;'; // Heart Unicode character
            // Add event listener or link if needed

            // Trash Bin Icon Button
            var trashButton = document.createElement('button');
            trashButton.className = 'triple-lite-icon-btn triple-lite-trash-btn';
            trashButton.innerHTML = '&#x1F5D1;'; // Trash bin Unicode character
            trashButton.onclick = function () {
                postOfferFeedback(offer.id, cardHolderId, apiKey, clientId, "HIDE_OFFER");
                overlay.style.display = 'block';
            };

            // Append icon buttons to cardBack
            cardBack.appendChild(heartButton);
            cardBack.appendChild(trashButton);

            // Assemble the card
            cardFlipInner.appendChild(cardFront);
            cardFlipInner.appendChild(cardBack);
            cardFlip.appendChild(cardFlipInner);

            // Append to the column
            col.appendChild(cardFlip);

            // Append column to row
            row.appendChild(col);
        });

        // Append row to container
        container.appendChild(row);
    }

    // Function to open the modal
    /*function openModal(id) {
        document.getElementById('triple-lite-modal-text').textContent = id;
        document.getElementById('triple-lite-details-modal').style.display = 'block';
    }

    // Get the modal
    var modal = document.getElementById('triple-lite-details-modal');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName('triple-lite-close')[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = 'none';
    }

    // Close the modal if the user clicks anywhere outside of it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }*/

    // Public API - Initialize the widget
    function init(config) {
        if (!config || !config.apiKey || !config.clientId) {
            console.error('Triple Lite Widget initialization error: Missing configuration parameters');
            return;
        }

        const { apiKey, clientId } = config;
        console.log('Triple Lite Widget initialized with API key:', apiKey, 'and client ID:', clientId)
            
        renderOffers(offerData, apiKey, clientId);
    }
    return { init: init };
})();
