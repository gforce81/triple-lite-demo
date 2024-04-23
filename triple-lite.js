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

    // Private function to check if the card account exists
    function checkCardAccount(apiKey, clientId, cardProgramExternalId, cardAccountExternalId) {
        return new Promise((resolve, reject) => {
            var url = `https://us-central1-triple-lite-mvp.cloudfunctions.net/checkCardAccount`;

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error('API request failed with status ' + xhr.status));
                    }
                }
            };
            var payload = JSON.stringify({
                clientId: clientId,
                apiKey: apiKey,
                cardProgramExternalId: cardProgramExternalId,
                cardAccountExternalId: cardAccountExternalId
            });

            xhr.send(payload);
        });
    }

    // Private function to fetch offers from the API
    async function fetchOffers(apiKey, clientId, callback) {

        // Generate or retrieve the user UUID -- this will be used as the cardHolderId
        var userId = getOrGenerateUUID();
        console.log("User UUID: " + localStorage.getItem('userUUID'));

        // Get the top level domain -- this is used for the program external ID
        var topLevelDomain = getDomain();
        topLevelDomain = "tripleLite--" + topLevelDomain; // e.g., "tripleLite--example.com"
        console.log("Top Level Domain: " + topLevelDomain);

        // Check if the card account exists or create it if it doesn't
        try {
            var cardAccount = await checkCardAccount(apiKey, clientId, topLevelDomain, userId);
            console.log(cardAccount);
            // Store the card account ID in local storage
            localStorage.setItem('cardAccountId', cardAccount.id);
        } catch (error) {
            console.error('Error checking card account:', error);
            callback(error, null);
            return;
        }

        getGeoLocation(function (error, location) {
            if (error) {
                console.error('Error getting location:', error);
                callback(error, null);
                return;
            }

            var lat = location.latitude;
            var lon = location.longitude;
            console.log(lat, lon);

            var url = `https://us-central1-triple-lite-mvp.cloudfunctions.net/getOffersRecommendations`;

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            console.log(data);
                            callback(null, data);
                        } catch (error) {
                            callback(error, null);
                        }
                    } else {
                        callback(new Error('API request failed with status ' + xhr.status), null);
                    }
                }
            };
            var payload = JSON.stringify({
                "clientId": clientId,
                "apiKey": apiKey,
                "cardAccountId": cardAccount.id,
                "excludeProviderId": [],
                "excludeOfferIds": [],
                "includeOfferIds": [],
                "latitude": lat,
                "longitude": lon
            });

            xhr.send(payload);
        });
    }

    // Private function to render offers on the webpage
    function renderOffers(recommended_offers, apiKey, clientId) {
        offers = recommended_offers.recommended_offers;
        cardHolderId = localStorage.getItem('cardAccountId');

        var container = document.getElementById('triple-lite-container');
        if (!container) {
            console.error('Triple Lite Widget error: Container element not found.');
            return;
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

    async function postOfferFeedback(offerId, cardHolderId, apiKey, clientId, eventType) {
        try {
            var response = await fetch('https://us-central1-triple-lite-mvp.cloudfunctions.net/postOffersFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cardAccountId: cardHolderId,
                    apiKey: apiKey,
                    clientId: clientId,
                    offerId: offerId,
                    eventType: eventType
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            var result = await response.json();
            console.log('Feedback posted successfully:', result);
        } catch (error) {
            console.error('Error posting feedback:', error);
        }
    }


    // Public API - Initialize the widget
    function init(config) {
        if (!config || !config.apiKey || !config.clientId) {
            console.error('Triple Lite Widget initialization error: Missing configuration parameters');
            return;
        }

        const { apiKey, clientId } = config;
        console.log('Triple Lite Widget initialized with API key:', apiKey, 'and client ID:', clientId)

        fetchOffers(apiKey, clientId, function (error, offers) {
            if (error) {
                console.error('Triple Lite Widget error:', error);
                return;
            }
            renderOffers(offers, apiKey, clientId);
        });
    }
    return { init: init };
})();
