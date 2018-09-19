import {GMap} from "./GMap";

export class GDirections {
    constructor(gmap) {
        this.map = gmap.getMap();
        this.infowindowDirection = null;
        this.travel_mode = 'DRIVING';
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
        this.geocoder = new google.maps.Geocoder();
        this.destination_markers = [];
        this.polylines = [];
        this.shadows = [];
        this.data = [];
        /*isSwapping -  shows if the origin address is on top field. There is the functionalty for changing origin and destination addresses */
        this.isSwapping = false;

        this.init();
        this.addEvents();
    }

    init() {        
        this.directionsDisplay.setMap(this.map);

        const origin_input = $j('#origin-input');
        const modesWrapper = $j('.travel-modes-wrapper');


        if( !this.isSwapping ) {
            origin_input.val(adAddress);
        }
        const destination_autocomplete = this.destinationAutocomplete();

        this.getBoundsPolyline();

        modesWrapper.on('click', (event)=> {
            let place = destination_autocomplete.getPlace(),
                activeModeBtn = $j(event.target.parentElement);

            if ( activeModeBtn.hasClass('travel-mode-btn') ) {
                this.highlightModeBtn(activeModeBtn);

                if ( $j('#destination-input').val() !== '' ) {
                    if (!place.geometry) {
                        return;
                    } else {
                        this.initRoutes(place);
                    }
                }
            }
        });
    }

    addEvents() {
        const directionsWrapper = $j('.directions-wrapper'),
            noDirectionsPopUp = $j('#noDirections'),
            closeBoxAddress = $j('#hide-boxAddress'),
            winWidth = window.innerWidth,
            closeDirectionsBtn = $j('#closeDirections'),
            fullDetailsBtn = $j('#showFullDetails'),
            detailsWrapper = $j('.direction-details-wrapper'),
            hideDetailsBtn = $j('#hideDetailsBtn'),
            destinationField = $j('#destination-input'),
            removeDestinationIcon = $j('#removeAddress'),
            swapRoutesBtn = $j('#swapRoutesBtn'),
            minMapBtn = $j("#minMapButton"),
            directionsBtn = $j("#directionsOnBigMap");

        directionsBtn.on("click", ()=> {
            if (displayContacts) {
                if (directionsWrapper.hasClass('shown')){
                    directionsWrapper.removeClass('shown');
                    minMapBtn.removeClass('bottomLeft');
                } else {
                    directionsWrapper.addClass('shown');
                    minMapBtn.addClass('bottomLeft');
                }
            } else {
                GMap.isInformPopUp() ;
                noDirectionsPopUp.addClass('active');
                setTimeout(()=> {
                    noDirectionsPopUp.removeClass('active');
                }, 4000);
            }
        });

        closeDirectionsBtn.on('click', ()=> {
            this.closeRoutes();
            detailsWrapper.removeClass('shortDetails');
            hideDetailsBtn.removeClass('visible');
            this.isSwapping = false;
        });

        fullDetailsBtn.on('click', ()=> {
            if (detailsWrapper.hasClass('fullDetails')){
                detailsWrapper.removeClass('fullDetails');
                detailsWrapper.addClass('shortDetails');
            } else {
                detailsWrapper.addClass('fullDetails');
                detailsWrapper.removeClass('shortDetails');

            }
        });

        hideDetailsBtn.on('click', ()=> {
            if (detailsWrapper.hasClass('shortDetails')){
                detailsWrapper.removeClass('shortDetails');
            } else {
                detailsWrapper.addClass('shortDetails');
            }
        });

        swapRoutesBtn.on('click', ()=> {
            if ( !destinationField.val() ) return false;
            this.swapping();
        });

        if ( displayContacts ) {
            google.maps.event.addListener(this.map, 'dblclick', (event)=> {
                let coordinates = event.latLng,
                    destination_input = $j('#destination-input'),
                    origin_input = $j('#origin-input');

                this.geocoder.geocode({'location': coordinates}, (results, status)=> {
                    if (status === google.maps.GeocoderStatus.OK) {
                        let clickMarker = results[0];
                        this.initRoutes(clickMarker, this.travel_mode);

                        if ( !this.isSwapping ) {
                            destination_input.val(clickMarker.formatted_address);
                        } else {
                            origin_input.val(clickMarker.formatted_address);
                        }
                    }

                });
            });
            closeBoxAddress.on('click', ()=> {
                if (directionsWrapper.hasClass('shown')){
                    directionsWrapper.removeClass('shown');
                    minMapBtn.removeClass('bottomLeft');
                } else {
                    directionsWrapper.addClass('shown');
                    minMapBtn.addClass('bottomLeft');
                }
            });
        }

        if ( winWidth < 768){
            destinationField.on('focus', ()=> {
                if ( destinationField.val() !== '' ) {
                    removeDestinationIcon.show();
                    destinationField.addClass('focused');
                } else {
                    removeDestinationIcon.hide();
                    destinationField.removeClass('focused');
                }
                destinationField.on('keyup', function() {
                    if ( destinationField.val() !== '' ) {
                        removeDestinationIcon.show();
                        destinationField.addClass('focused');
                    } else {
                        removeDestinationIcon.hide();
                        destinationField.removeClass('focused');
                    }
                });

            });

            removeDestinationIcon.on('mousedown', ()=> {
                destinationField.val("");
                removeDestinationIcon.hide();
            });

            destinationField.on('blur', ()=> {
                removeDestinationIcon.hide();
                destinationField.removeClass('focused');
            });
        }
    }

    swapping() {
        const originField = document.getElementById('origin-input'),
            destinationField = document.getElementById('destination-input'),
            originVal = originField.value,
            destinationVal = destinationField.value;

        this.isSwapping = !this.isSwapping;

        if ( !this.isSwapping ) {
            originField.setAttribute("disabled", "disabled");
            destinationField.removeAttribute("disabled");

            this.geocoder.geocode({"address": originVal }, (results, status)=> {
                if (status === google.maps.GeocoderStatus.OK) {
                    this.initRoutes(results[0], this.travel_mode);
                }
            });
        } else {
            originField.removeAttribute("disabled");
            destinationField.setAttribute("disabled", "disabled");

            this.geocoder.geocode({"address": destinationVal }, (results, status)=> {
                if (status === google.maps.GeocoderStatus.OK) {
                    this.initRoutes(results[0], this.travel_mode);
                }
            });
        }
        destinationField.value = originVal;
        originField.value = destinationVal;
    }

    getBoundsPolyline() {
        google.maps.Polyline.prototype.getBounds = function(startBounds) {
            if(startBounds) {
                var bounds = startBounds;
            }
            else {
                var bounds = new google.maps.LatLngBounds();
            }
            this.getPath().forEach(function(item, index) {
                bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
            });

            return bounds;
        };
    }

    destinationAutocomplete() {
        const destination_input = document.getElementById('destination-input');
        let destination_autocomplete = new google.maps.places.Autocomplete(destination_input, {types: ["geocode"]});
        destination_autocomplete.bindTo('bounds', this.map);

        google.maps.event.addListener(destination_autocomplete, 'place_changed', ()=> {
            let place = destination_autocomplete.getPlace();
            if (!place.geometry) {
                this.getFirstAutocomplete(destination_input);
            } else {
                this.initRoutes(place);
            }
        });

        return destination_autocomplete;
    }

    initRoutes(place) {
        this.clearMarkers();

        if (!place.geometry) {
            console.log("Autocomplete's returned place contains no geometry");
            return;
        }
        this.expandViewportToFitPlace(place);
        this.createDestinationMarker(place);
        this.directionsDisplay.setPanel(document.getElementById('search-result-wrapper'));

        // If the place has a geometry, store its place ID and route if we have the other place ID
        let destination_place_id = place.place_id;

        this.getRoute(destination_place_id);

        $j('.direction-details-wrapper').addClass('shortDetails');
        $j('#hideDetailsBtn').addClass('visible');

        let areDestanitaionMarkers = this.destination_markers.length > 0;
        if ( areDestanitaionMarkers ) {
            google.maps.event.addListener(this.destination_markers[0], 'dragend', ()=> {
                this.dragDestinationMarker();
            });
        }
    }

    expandViewportToFitPlace(place) {
        if (place.geometry.viewport) {
            this.map.fitBounds(place.geometry.viewport);
        } else {
            this.map.setCenter(place.geometry.location);
        }
    }

    createDestinationMarker(place) {
        let destinationMarker = new google.maps.Marker({
            map: this.map,
            anchorPoint: new google.maps.Point(0, -29),
            draggable: true
        });
        this.destination_markers.push(destinationMarker);
        destinationMarker.setPosition(place.geometry.location);
    }


    getRoute(destination_place_id) {
        let request = null;

        if( !this.isSwapping ) {
            request = {
                origin: myLatlng,
                destination: {'placeId': destination_place_id},
                travelMode: google.maps.TravelMode[this.travel_mode],
                unitSystem: google.maps.UnitSystem.METRIC,
                provideRouteAlternatives: true
            };
        } else {
            request = {
                origin: {'placeId': destination_place_id},
                destination: myLatlng,
                travelMode: google.maps.TravelMode[this.travel_mode],
                unitSystem: google.maps.UnitSystem.METRIC,
                provideRouteAlternatives: true
            };
        }

        if (!myLatlng || !destination_place_id) {
            return;
        }

        this.directionsService.route(request, (response, status)=> {
            this.directionsDisplay.setDirections(response);
            // clear former polylines
            for(let j in  this.polylines ) {
                this.polylines[j].setMap(null);
                this.shadows[j].setMap(null);
            }
            this.polylines = [];
            this.shadows = [];
            this.data = [];

            if (status === google.maps.DirectionsStatus.OK) {
                let bounds = new google.maps.LatLngBounds();
                for ( let i in response.routes ) {

                    // let's make the first suggestion highlighted;
                    let hide = i !== 0;
                    let shadow = this.drawPolylineShadow(response.routes[i].overview_path, '#666666');
                    let line = this.drawPolyline(response.routes[i].overview_path, '#ed692c', hide);
                    this.polylines.push(line);
                    this.shadows.push(shadow);


                    let infoDistance = response.routes[i].legs[0].distance.text;
                    let infoDuration = response.routes[i].legs[0].duration.text;
                    let modeIcon = this.getModeIcon();

                    let contentString =
                        '<div style="padding:0">' +
                        modeIcon +
                        '<span style="color: #ed692c; position: relative; top: -7px; font-weight: bold;">'+ infoDistance +'</span><br/>'+
                        '<span>'+ infoDuration +'</span>' +
                        '</div>';

                    let popupPosition;
                    if ( i === 0 ) {
                        let m = Math.ceil((response.routes[i].overview_path.length)/2);
                        popupPosition = response.routes[i].overview_path[m]; //middle point of direction
                    } else {
                        let randomNum = GDirections.getRandomInt(1, 9);
                        let m = Math.ceil((response.routes[i].overview_path.length)/randomNum);
                        popupPosition = response.routes[i].overview_path[m];

                    }

                    this.infowindowDirection = new google.maps.InfoWindow({
                        content: contentString,
                        position: popupPosition,
                        map: this.map,
                        maxWidth : 100
                    });
                    this.infowindowDirection.open(this.map, shadow);

                    bounds = line.getBounds(bounds);

                    let self = this;
                    google.maps.event.addListener(shadow, 'click', function(){
                        // detect which route was clicked on
                        let index = self.shadows.indexOf(this);
                        self.highlightRoute(index);
                    });

                }
                this.map.fitBounds(bounds);
            }
        });
    }

    // this makes one of the colored routes visible.
    highlightRoute(index) {
        for(let j in  this.polylines ) {
            if( j === index.toString() ) {
                this.polylines[j].setMap(this.map);
            }
            else {
                this.polylines[j].setMap(null);
            }
        }
    }

    // if hide is set to true, the line is not put on the map
    drawPolyline(path, color, hide) {
        let line = new google.maps.Polyline({
            path: path,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 3
        });
        if(! hide) {
            line.setMap(this.map);
        }
        return line;
    }

    drawPolylineShadow(path, color, hide) {
        let line = new google.maps.Polyline({
            path: path,
            strokeColor: color,
            strokeOpacity: 0.4,
            strokeWeight: 7
        });
        if(! hide) {
            line.setMap(this.map);
        }
        return line;
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getModeIcon() {
        let modeIcon;
        if ( this.travel_mode === 'DRIVING' ) {
            modeIcon = '<i class="material-icons" style="position: relative; left: -3px;">directions_car</i>';
        } else if  ( this.travel_mode === 'TRANSIT' ) {
            modeIcon = '<i class="material-icons" style="position: relative; left: -3px;">directions_bus</i>';
        } else if  ( this.travel_mode === 'WALKING' ) {
            modeIcon = '<i class="material-icons" style="position: relative; left: -3px;">directions_run</i>';
        } else {
            modeIcon = '<i class="material-icons" style="width: 32px;">directions_bike</i>';
        }
        return modeIcon;
    }

    // Removes the markers from the map, but keeps them in the array.
    clearMarkers() {
        for (let i = 0; i < this.destination_markers.length; i++) {
            this.destination_markers[i].setMap(null);
        }
        this.destination_markers = [];
    }

    /*Travel mode - car | bus | cycle | feet*/
    highlightModeBtn(selectedBtn) {
        let modeBtns = $j('.travel-mode-btn');

        for ( let i = 0; i < modeBtns.length; i++ ) {
            if ( $j(modeBtns[i]).hasClass('active') ) {
                $j(modeBtns[i]).removeClass('active');
            }
        }
        selectedBtn.addClass('active');
        this.setTravelMode(selectedBtn);
    }

    setTravelMode(selectedBtn) {
        let mode = selectedBtn.attr('id').toUpperCase(),
            detailsWrapper = $j('.direction-details-wrapper');

        if (mode === 'TRANSIT') {
            detailsWrapper.addClass('bus-details');
        } else {
            detailsWrapper.removeClass('bus-details');
        }
        this.travel_mode = mode;
    }


    findPos(obj) {
        let curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop - 70;
            } while (obj = obj.offsetParent);
            return [curtop];
        }
    }

    getFirstAutocomplete(destination_input) {
        let autocompleteVal = document.querySelector('.pac-container .pac-item');

        let destinationArr = [];
        for (let i = 0; i < autocompleteVal.childNodes.length; i++) {
            let partWord = autocompleteVal.childNodes[i],
                partWordText = partWord.innerText || partWord.textContent;
            if (partWordText) {
                destinationArr.push(partWordText);
            }
        }
        let destinationAddress = destinationArr.join(' ');
        let inputResult = destinationArr.join(', ');

        this.geocoder.geocode({"address": destinationAddress }, (results, status)=> {
            if (status === google.maps.GeocoderStatus.OK) {
                destination_input.value = inputResult;
                this.initRoutes(results[0]);
            }
        });
    }

    dragDestinationMarker() {
        let destMarker = this.destination_markers[0],
            latitude = destMarker.getPosition().lat(),
            longitude = destMarker.getPosition().lng(),
            latlng = {
                lat: parseFloat(latitude),
                lng: parseFloat(longitude)
            },
            locationMarker,
            destination_input = document.getElementById('destination-input'),
            origin_input = document.getElementById('origin-input');

        this.geocoder.geocode({'location': latlng}, (results, status)=> {
            if (status === google.maps.GeocoderStatus.OK) {
                locationMarker = results[0];
            }
            this.getRoute(locationMarker.place_id);

            if (!this.isSwapping) {
                destination_input.value = locationMarker.formatted_address;
            } else {
                origin_input.value = locationMarker.formatted_address;
            }
        });
    }

    closeRoutes() {
        this.directionsDisplay.set('directions', null);
        let destination_input = document.getElementById('destination-input'),
            origin_input = document.getElementById('origin-input');

        if ( this.isSwapping ) {
            origin_input.value = destination_input.value;
            origin_input.removeAttribute("disabled");
            destination_input.setAttribute("disabled", "disabled");
        }

        origin_input.setAttribute("disabled", "disabled");
        destination_input.removeAttribute("disabled");
        destination_input.value = '';

        for ( let j in  this.polylines ) {
            this.polylines[j].setMap(null);
            this.shadows[j].setMap(null);
        }

        for ( let k in  this.destination_markers ) {
            this.destination_markers[k].setMap(null);
        }
        this.destination_markers = [];

        let sideBar = document.querySelector('.directions-wrapper');
        sideBar.classList.remove('shown');
    }

    static closeLightPopup(button) {
        let popUp = button.parentNode;
        popUp.classList.remove('active');
    }

    showAddressPanelOrPopup() {
        if(displayContacts) {
            $j('.directions-wrapper').show();
            $j('.directions-wrapper').addClass('shown');
           
        } else {
            $j('#noDirections').addClass('active');
            setTimeout(()=> {
                $j('#noDirections').removeClass('active');
            }, 4000);
        }
    }
}