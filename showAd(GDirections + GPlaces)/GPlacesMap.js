import {hightLightTablePlaces, removeHighLightPlacesFromTable} from "./GPlaces";

export class GPlacesMap {
    constructor(gmap, data) {
        this.map = gmap.getMap();
        this.places = data;
        this._infoWindow = null;
        this._placeMarkers = [];

        this.init();
    }


    getPlaceMarkers() {
        this.places.forEach( (place)=> {
            const position = new google.maps.LatLng(place.lat, place.lng);
            let iconImg,
                iconTransport = this.loopTypesTransport(place.types);

            if ( place.type === 'store') {
                iconImg = '/img/markers/shopping-cart-map-small.png';
            } else if ( place.type === 'restaurant' ) {
                iconImg = '/img/markers/knife-and-fork-map-small.png';
            } else if ( place.type === 'gym' ) {
                iconImg = '/img/markers/dumbbell-map-small.png';
            } else if ( place.type === 'school' ) {
                iconImg = '/img/markers/book-small.png';
            } else if (place.type === 'transit_station') {
                iconImg = iconTransport;
            }

            const iconPlace = {
                url: iconImg,
                scaledSize: new google.maps.Size(20, 20),
                zIndex: 1
            };
            const marker = new google.maps.Marker({
                position: position,
                icon: iconPlace,
                id: place.name
            });

            marker.addListener('click', ()=> {
                if(this._infoWindow) {
                    this._infoWindow.close();
                }

                if ( marker.icon.zIndex === 2 ) {
                    GPlacesMap.unhightLightMarker(marker);
                    removeHighLightPlacesFromTable();
                    if(this._infoWindow) {
                        this._infoWindow.close();
                    }
                } else {
                    GPlacesMap.removeHighLightMapIcons(this._placeMarkers);
                    GPlacesMap.hightlightMapMarker(marker);

                    removeHighLightPlacesFromTable();
                    GPlacesMap.highLightPlaceFromTable(marker.id);

                    this._infoWindow = new google.maps.InfoWindow({
                        content: '<img class="popUp-img" style="float: left; width: 20px; height: 20px;" src=' + iconImg + '>' + '<span class="popUp-name" style="float: left; margin-top: 1px; margin-left: 5px;">' + place.name + '</span>'
                    });
                    this._infoWindow.open(this.map, marker);
                }
            });
            this._placeMarkers.push(marker);

        });
        return this._placeMarkers;
    }

    get infoWindow() {
        return this._infoWindow;
    }

    static hightlightMapMarker(marker) {
        let newIconUrl = marker.icon.url.substr(0, marker.icon.url.indexOf('.png')) + '-selected.png';
        marker.setIcon({
            url : newIconUrl,
            scaledSize: new google.maps.Size(30, 30),
            zIndex: 2
        });
    }

    static unhightLightMarker(marker) {
        let newIconUrl = marker.icon.url.substr(0, marker.icon.url.indexOf('-selected')) + '.png';
        marker.setIcon({
            url : newIconUrl,
            scaledSize: new google.maps.Size(20, 20),
            zIndex: 1
        });
    }

    static removeHighLightMapIcons(placesIcons) {
        for (let i = 0; i < placesIcons.length; i++) {
            let placeIconMap = placesIcons[i];

            if ( placeIconMap.icon.zIndex === 2 ) {
                GPlacesMap.unhightLightMarker(placeIconMap);
            }
        }
    }

    static highLightPlaceFromTable(placeMapId) {
        let nameOfPlaceElements = $j(".placesList .wrapper").find(".name");
        for (let j = 0; j < nameOfPlaceElements.length; j++) {
            let nameOfPlaceText = $j(nameOfPlaceElements[j]).text();

            if (nameOfPlaceText === placeMapId) {
                $j(nameOfPlaceElements[j]).parent().addClass("selected");
            }
        }
    }

    loopTypesTransport (typesTransportArray) {
        let iconTransport;
        for (let k = 0; k < typesTransportArray.length; k++) {
            if ( typesTransportArray[k].hasOwnProperty('subway_station') ) {
                iconTransport = '/img/markers/subway.png';
                break;
            } else if ( typesTransportArray[k].hasOwnProperty('train_station') ) {
                iconTransport = '/img/markers/train.png';
                break;
            } else if ( typesTransportArray[k].hasOwnProperty('light_rail_station') ) {
                iconTransport = '/img/markers/tram-map-small.png';
                break;
            }  else {
                iconTransport = '/img/markers/bus-map-small.png';
            }
        }
        return iconTransport;
    }

    setPlacesOnMap() {
        for (let i = 0; i < this._placeMarkers.length; i++) {
            this._placeMarkers[i].setMap(this.map); //Add the marker to the map
        }
    }

    hidePlacesOnMap() {
        for (let i = 0; i < this._placeMarkers.length; i++) {
            this._placeMarkers[i].setMap(null); //Add the marker to the map
        }
    }

    setZoomLevelMap() {
        let zoomLevel;
        const placesAmount = this.places.length;

        if (placesAmount < 4) {
            zoomLevel = 8;
        } else if (placesAmount < 11) {
            zoomLevel = 11;
        } else {
            zoomLevel = 15;
        }
        this.map.setZoom(zoomLevel);
    }

    addMapEvents() {
        google.maps.event.addListener(this.map, 'zoom_changed', ()=> {
            if (this.map.getZoom() > 14) {
                this.setPlacesOnMap();
            } else {
                this.hidePlacesOnMap();
            }

            if (this.map.getZoom() > 16) {
                this.increaseSizeIcons();
            } else {
                this.reduceSizeIcons();
            }
        });
    }

    increaseSizeIcons() {
        for (let j in this._placeMarkers) {
            let iconPlace = this._placeMarkers[j].getIcon();
            let placeMarker = this._placeMarkers[j];
            var icon = {
                url: iconPlace.url, // url
                scaledSize:  new google.maps.Size(30, 30),
                zIndex: iconPlace.zIndex
            };

            placeMarker.setIcon(icon);
        }
    }

    reduceSizeIcons() {
        for (let j in this._placeMarkers) {
            let iconPlace = this._placeMarkers[j].getIcon();
            let placeMarker = this._placeMarkers[j];
            var icon = {
                url: iconPlace.url, // url
                scaledSize:  new google.maps.Size(20, 20),
                zIndex: iconPlace.zIndex
            };
            placeMarker.setIcon(icon);

        }
    }

    init() {
        this.getPlaceMarkers();
        this.setPlacesOnMap();
        this.setZoomLevelMap();
        this.addMapEvents();

        hightLightTablePlaces(this.getPlaceMarkers());
    }
}