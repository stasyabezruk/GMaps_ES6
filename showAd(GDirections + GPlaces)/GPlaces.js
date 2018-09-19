import {GPlacesMap} from "./GPlacesMap";

export function tablePlaces (places ) {
    $j('.loading-icon').hide();

    var busList = $j('#bus-list'),
        placesList  = $j('#nearPlaces-list'),
        busArray = [],
        placesArray = [];

    places.forEach( function ( place ) {
        if( place.type === "transit_station" ) {
            busArray.push(place);
        } else {
            placesArray.push(place);
        }
    });

    if ( busArray.length > 5 ) {
        busList.addClass('fewPlaces');
    }

    if ( busArray.length === 0 ) {
        busList.addClass('noPlaces');
    } else {
        busList.find('.title').show();
    }
    if ( !busList.hasClass('noPlaces') ) {
        $j('.blog-wrapper').hide();
    }

    if ( placesArray.length > 5 ) {
        placesList.addClass('fewPlaces');
    }
    if ( placesArray.length === 0 ) {
        placesList.addClass('noPlaces');
    } else {
        placesList.find('.title').show();
    }

    if ( !placesList.hasClass('noPlaces') ) {
        $j('.recommendations').hide();
    }

    if (busArray.length > 10) {
        var newBusArr = newTopTenArray(busArray);
        displayTransport(newBusArr);
    } else {
        displayTransport(busArray);
    }

    displayPlaces(placesArray);
}
//first 10 places - array with strings
function firstTransportArr (fullBusArray) {
    var i,
        middleArr,
        transportArr = [];

    middleArr = fullBusArray.map( function (item) {
        return item.types
    });

    for ( i = 0; i < 10; i++ ) {
        var typeTransport = null;
        if ( middleArr[i].hasOwnProperty('subway_station') ) {
            typeTransport = 'subway_station';
        } else if ( middleArr[i].hasOwnProperty('train_station') ) {
            typeTransport = 'train_station';
        } else if ( middleArr[i].hasOwnProperty('light_rail_station') ) {
            typeTransport = 'light_rail_station';
        }  else {
            typeTransport = 'bus_station';
        }
        transportArr.push(typeTransport);
    }
    return transportArr;
}

//check type of transport
function checkType(arr, typeTransport) {
    return arr.some(function(arrVal) {
        return typeTransport === arrVal;
    });
}

//second 10 places - array with strings
function secondTransportArr (fullBusArray) {
    var i,
        middleArr,
        transportArr = [];

    middleArr = fullBusArray.map( function (item) {
        return item.types
    });

    for ( i = 10; i < fullBusArray.length; i++ ) {
        var typeTransport;
        if ( middleArr[i].hasOwnProperty('subway_station') ) {
            typeTransport = 'subway_station';
        } else if ( middleArr[i].hasOwnProperty('train_station') ) {
            typeTransport = 'train_station';
        } else if ( middleArr[i].hasOwnProperty('light_rail_station') ) {
            typeTransport = 'light_rail_station';
        }  else {
            typeTransport = 'bus_station';
        }
        transportArr.push(typeTransport);
    }
    return transportArr;
}

//get transport from the hidden places. This type of transport isn't in the first 10 places
function getBottomTransport (fullBusArray, typeTransport) {
    var i;
    for(i = 10; i < fullBusArray.length; i++) {
        var typesArray = fullBusArray[i].types;

        var isTransport = typesArray.some(function (type) {
            return typeTransport === type;
        });

        if (isTransport) {
            return fullBusArray[i];
            break;
        }
    }
}

//get array of places that aren't in the 1-st 10 places, but we'll add the them
function wantedPlaces (busArray) {
    var transportArr = firstTransportArr(busArray),
        bottomArr = secondTransportArr(busArray),
        addedArr = [],

        isSubway = checkType(transportArr, 'subway_station'),
        isTrain = checkType(transportArr, 'train_station'),
        isTram = checkType(transportArr, 'light_rail_station'),

        isSubwaySecond = checkType(bottomArr, 'subway_station'),
        isTrainSecond = checkType(bottomArr, 'train_station'),
        isTramSecond = checkType(bottomArr, 'light_rail_station');

    if (!isSubway) {  //console.log('noSubways');
        if (isSubwaySecond) {
            var newSubway = getBottomTransport(busArray, 'subway_station');
            addedArr.push(newSubway);
        }
    }
    if (!isTrain) { //console.log('noTrains');
        if (isTrainSecond) {
            var newTrain  = getBottomTransport(busArray, 'train_station');
            addedArr.push(newTrain);
        }
    }
    if (!isTram) {  //console.log('noTrams');
        if (isTramSecond) {
            var newTram = getBottomTransport(busArray, 'light_rail_station');
            addedArr.push(newTram);
        }
    }

    if (addedArr.length > 0) {
        /*sorting new array in descending order by distance*/
        addedArr.sort(function(a, b){
            return b.km-a.km
        });
        return addedArr;
    } else {
        return false;
    }
}
//replace the last items of fisrt array with items of new array
function newTopTenArray (busArray) {
    var wantedArr = wantedPlaces(busArray),
        removedElements = busArray.length - 10,
        deleteCount = busArray.length - removedElements,
        i = 0, k = 0;

    busArray.splice(10, deleteCount);

    for (i; i < busArray.length; i++) {
        if ( k >= wantedArr.length) { break; }
        for (k; k < wantedArr.length; k++) {

            var newPlace = wantedArr[k];
            var lastIndexOfFirstArr = busArray.length - (i + 1);
            busArray.splice(lastIndexOfFirstArr, 1, newPlace);
        }
    }
    return busArray;
}

function displayTransport(busArray) {
    var wrapperTransport = $j('.content-transport'),
        i;

    for (i = 0; i < busArray.length; i++) {
        if (i == 10) { break; }
        var typesArray = busArray[i].types;


        var busWrapper = $("<div/>", {
            class: 'busWrapper wrapper'
        }).appendTo(wrapperTransport);

        var iconBusWrapper = $j("<div/>", {
            class: 'iconBusWrapper iconWrapper'
        }).appendTo(busWrapper);

        var iconTransport = iconTypesTransport(typesArray);
        var iconBus = $j("<img/>", {
            src : iconTransport,
            class : 'iconBus'
        }).appendTo(iconBusWrapper);

        var nameBus = $j("<div/>", {
            class: 'nameBus name',
            text : htmlUnescape(busArray[i].name)
        }).appendTo(busWrapper);

        if ( busArray[i].min < 30 ) {
            var timeWrapper = $j("<div/>", {
                class: 'timeWrapper',
                text: busArray[i].min + ' min'
            }).appendTo(busWrapper);
            var iconManWrapper = $j("<div/>", {
                class: 'iconManWrapper'
            }).appendTo(busWrapper);
            var iconMan = $j("<img/>", {
                src : '/img/markers/pedestrian-walking.png',
                class : 'iconMan'
            }).appendTo(iconManWrapper);
        } else {
            var distance = $j("<div/>", {
                class: 'distance',
                text: busArray[i].apprkm + ' km'
            }).appendTo(busWrapper);
            var roadIconWrapper = $j("<div/>", {
                class: 'roadIconWrapper'
            }).appendTo(busWrapper);
            var roadIcon = $j("<img/>", {
                src : '/img/markers/road.png',
                class : 'roadIcon'
            }).appendTo(roadIconWrapper);
        }
    }

}
function iconTypesTransport (typesTransportArray) {
    var iconTransport;
    for (var k = 0; k < typesTransportArray.length; k++) {
        if ( typesTransportArray[k].hasOwnProperty('subway_station') ) {
            iconTransport = '/img/markers/subway.png';
            break;
        } else if ( typesTransportArray[k].hasOwnProperty('train_station') ) {
            iconTransport = '/img/markers/train.png';
            break;
        } else if ( typesTransportArray[k].hasOwnProperty('light_rail_station') ) {
            iconTransport = '/img/markers/tram.png';
            break;
        }  else {
            iconTransport = '/img/markers/bus.png';
        }
    }
    return iconTransport;
}
function displayPlaces(placesArray) {
    var wrapperPlaces = $j('.content-places'),
        j;

    for (j = 0; j < placesArray.length; j++) {
        if (j == 20) { break; }

        var imgPlace;
        if ( placesArray[j].type == 'store') {
            imgPlace = '/img/markers/shopping-cart.png';
        } else if ( placesArray[j].type == 'restaurant' ) {
            imgPlace = '/img/markers/knife-and-fork.png';
        } else if ( placesArray[j].type == 'gym' ) {
            imgPlace = '/img/markers/dumbbell.png';
        } else if ( placesArray[j].type == 'school' ) {
            imgPlace = '/img/markers/book.png';
        }

        var placeWrapper = $j("<div/>", {
            class: 'placeWrapper wrapper'
        }).appendTo(wrapperPlaces);

        var iconPlaceWrapper = $j("<div/>", {
            class: 'iconPlaceWrapper iconWrapper'
        }).appendTo(placeWrapper);

        var iconPlace = $j("<img/>", {
            src : imgPlace,
            class : 'iconPlace'
        }).appendTo(iconPlaceWrapper);

        var namePlace = $j("<div/>", {
            class: "namePlace name",
            text : htmlUnescape(placesArray[j].name),
        }).appendTo(placeWrapper);

        var address = $j("<div/>", {
            class: "address",
            text : "- " + placesArray[j].addr,
        }).appendTo(placeWrapper);

        if ( placesArray[j].min < 30 ) {
            var timeWrapper = $j("<div/>", {
                class: 'timeWrapper',
                text: placesArray[j].min + ' min'
            }).appendTo(placeWrapper);

            var iconManWrapper = $j("<div/>", {
                class: 'iconManWrapper'
            }).appendTo(placeWrapper);
            var iconMan = $j("<img/>", {
                src : '/img/markers/pedestrian-walking.png',
                class : 'iconMan'
            }).appendTo(iconManWrapper);
        } else {
            var distance = $j("<div/>", {
                class: 'distance',
                text: placesArray[j].apprkm + ' km'
            }).appendTo(placeWrapper);
            var roadIconWrapper = $j("<div/>", {
                class: 'roadIconWrapper'
            }).appendTo(placeWrapper);
            var roadIcon = $j("<img/>", {
                src : '/img/markers/road.png',
                class : 'roadIcon'
            }).appendTo(roadIconWrapper);
        }
    }
}

function htmlUnescape(str){
    return str
        .replace(/&#034;/g, '"')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');
}

export function hightLightTablePlaces(placesIcons) {
    let previousTarget = null;
    $j(".placesList").on("click", (e)=> {

        if ( $j(e.target).parent().hasClass("wrapper") || $j(e.target).parent().parent().hasClass("wrapper") || $j(e.target).hasClass("wrapper") ) {

            let placeWrapper = null;

            //needed vanilla Javascript
            if ($j(e.target).parent().hasClass("wrapper")) {
                placeWrapper = e.target.parentNode;
            } else if ($j(e.target).hasClass("wrapper")) {
                placeWrapper = e.target;
            } else {
                placeWrapper = e.target.parentNode.parentNode;
            }

            if (window.gPlaces.infoWindow) {
                window.gPlaces.infoWindow.close();
            }
            if (previousTarget !== placeWrapper && !$j(placeWrapper).hasClass("selected")) {

                removeHighLightPlacesFromTable();

                $j(placeWrapper).addClass("selected");
                let nameOfPlace = $j(placeWrapper).find(".name").text();

                highLightMapIcons(placesIcons, nameOfPlace);

                previousTarget = placeWrapper;
            } else {
                $j(placeWrapper).removeClass("selected");
                GPlacesMap.removeHighLightMapIcons(placesIcons);
                previousTarget = null;
            }

        }
    })
}

function highLightMapIcons(placesIcons, placeName) {
    GPlacesMap.removeHighLightMapIcons(placesIcons);

    for (let i = 0; i < placesIcons.length; i++) {
        let placeIconMap = placesIcons[i],
            placeIconMapId = placeIconMap.get("id");

        if (placeName === placeIconMapId) {
            GPlacesMap.hightlightMapMarker(placeIconMap);
        }
    }
}

export function removeHighLightPlacesFromTable() {
    let placesWrapper = $j(".placesList .wrapper");
    for (let j = 0; j < placesWrapper.length; j++) {
        if ( $j(placesWrapper[j]).hasClass("selected") ) {
            $j(placesWrapper[j]).removeClass("selected");
        }
    }
}

