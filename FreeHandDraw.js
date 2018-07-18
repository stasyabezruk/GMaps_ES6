import {
    disableScroll,
    enableScroll,
    resetMap
} from "../../../shared/index";

import {search} from "../onLoadSearch";

export class FreeHandDraw  {
    constructor(el) {
        this._el = $j(el);
        this._poly = null;
        this.removePolyMarker = null;
        this.movingEvent = null;
        this.init();

    }

    get el() {
        return this._el;
    }

    get poly() {
        return this._poly;
    }

    init() {
        $j('#freeHandDrawBtn').on('click', ()=> {
            const map = window.map.getMap();

            if ($j("#freeDraw-modal").hasClass("in")) { //if free draw modal is visible - hide it
                $j("#freeDraw-modal").modal('hide');
            }

            if (!this._el.hasClass('removeDrawBtn')) {
                FreeHandDraw.clearMap(map);

                if (this._el.hasClass('activeDraw')) {
                    this.deselectFreeDrawButton(map);

                } else {
                    this._el.addClass('activeDraw');
                    google.maps.event.addDomListener(map.getDiv(), 'mousedown', ()=> {
                        this.drawPolygon(map);
                    });
                }
            } else {
                this.removePoly();
            }
        });

    }

    deselectFreeDrawButton(map) {
        this._el.removeClass('activeDraw');
        google.maps.event.clearListeners(map.getDiv(), 'mousedown');
        FreeHandDraw.enableMap(map);
        this._poly = null;
        search();
    }

    drawPolygon(map) {
        this._poly = new google.maps.Polyline({ map: map, clickable: false });

        this.movingEvent = google.maps.event.addListener( map, 'mousemove', (e)=> {
            this._poly.getPath().push(e.latLng);
        });

        google.maps.event.addListenerOnce( map, 'mouseup', ()=> {
            google.maps.event.removeListener(this.movingEvent);

            const path = this._poly.getPath();
            this._poly.setMap(null);
            this._poly = new google.maps.Polygon({
                map: map,
                path: path
            });

            google.maps.event.clearListeners(map.getDiv(), 'mousedown');
            this._el.removeClass('activeDraw');
            this._el.addClass('removeDrawBtn');
            FreeHandDraw.enableMap(map);

            this.searchByPolyggon();

            this.setZoomLevel(map);
            const markerPoint = this.getPointForMarker();
            this.removePolyMarker = new RemoveFreeDrawMarker(map, markerPoint, this.poly, this.el);
        });
    }

    setZoomLevel(map) {
        let bounds = new google.maps.LatLngBounds();
        const coords = this._poly.getPath();

        for (let i = 0; i < coords.getLength(); i++) {
            const xy = coords.getAt(i);
            let point = new google.maps.LatLng(xy.lat(), xy.lng());
            bounds.extend(point);
        }
        map.fitBounds(bounds);
    }

    getCoordinates() {
        let newArr = [];
        const coords = this._poly.getPath();
        for (let i = 0; i < coords.getLength(); i++) {
            const xy = coords.getAt(i);
            let coord = `${xy.lat()} ${xy.lng()}`;
            newArr.push(coord);
        }
        return newArr.join();
    }

    getPointForMarker() {
        const coords = this._poly.getPath();
        const xy = coords.getAt(0);
        const startPoint = new google.maps.LatLng(xy.lat(), xy.lng());
        return startPoint;
    }

    searchByPolyggon() {
        const strCoords = this.getCoordinates();
        $j('#selectedPolygon').val(strCoords);
        search();
    }

    removePoly() {
        if (this._poly) {
            this._poly.setMap(null);
            this._poly = null;
        }

        this._el.removeClass('removeDrawBtn');

        if (this.removePolyMarker) {
            this.removePolyMarker.remove();
        }

        if ( !$j('#countyList').val() ) {
            resetMap();
        }
        $j('#selectedPolygon').val('');
        search();
    }

    getExistingPolygonCoords() {
        const latLngArr = $j('#selectedPolygon').val().split(",");
        let polyCoords = [];

        for (let i = 0; i < latLngArr.length; i++) {
            const latLngEl = latLngArr[i].split(" ");
            const lat = latLngEl[0];
            const lng = latLngEl[1];
            const latLngCoordinate = new google.maps.LatLng(lat, lng);
            polyCoords.push(latLngCoordinate);
        }

        return polyCoords;
    }

    getPolygonFromCoords() {
        const map = window.map.getMap();
        const coords = this.getExistingPolygonCoords();

        this._poly = new google.maps.Polygon({
            map: map,
            path: coords
        });

        const markerPoint = this.getPointForMarker();
        this.removePolyMarker = new RemoveFreeDrawMarker(map, markerPoint, this.poly, this.el);

        this.setZoomLevel(map);
    }

    static exists() {
        if ($j('#selectedPolygon').val()) {
            return true;
        }
        return false;
    }

    static clearMap(map) {
        resetMap();

        $j("#radius").val('');
        $j("#radiusSearch").removeClass("active");
        $j("#selectedCriterias .group.municipalities").removeClass("disabled");
        $j("#selectedCriterias .group.municipalities.autofill").removeClass("autofill");

        window.gMarkers.hideMarkers();
        FreeHandDraw.disableMap(map);
    }

    static disableMap(map) {
        disableScroll();
        $j("#radiusSearch").hide();

        map.setOptions({
            draggable: false,
            scrollwheel: false,
            scaleControl: false,
            navigationControl: false,
            mapTypeControl: false,
            zoomControl: false,
            disableDoubleClickZoom: false
        });
    }

    static enableMap(map) {
        enableScroll();
        $j("#radiusSearch").show();

        map.setOptions({
            draggable: true,
            scrollwheel: true,
            scaleControl: true,
            navigationControl: true,
            mapTypeControl: true,
            zoomControl: true,
            disableDoubleClickZoom: true
        });
    }
}

class RemoveFreeDrawMarker extends google.maps.OverlayView {
    constructor(map, latlng, poly, firstBtn) {
        super();
        this.latlng = latlng;
        this.div = null;
        this.poly = poly;
        this.firstBtn = firstBtn;

        this.setMap(map);
    }

    //draw - function is used in API
    draw() {
        let div = this.div;

        if (!div) {
            div = this.div = document.createElement('DIV');
            div.style.position = "absolute";
            div.classList.add('removePolyBtn');
            div.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';

            let panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(div);

            google.maps.event.addDomListener(div, "click", ()=> {
                google.maps.event.trigger(this, "click");
                this.removeFreeDraw();
            });


        }

        const point = this.getProjection().fromLatLngToDivPixel(this.latlng);
        if (point) {
            div.style.left = (point.x - $j(div).width()) + 'px';
            div.style.top = (point.y - $j(div).height()) + 'px';
        }
    }

    //remove - function is used in API
    remove () {
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
            this.setMap(null);
        }
    }

    removeFreeDraw() {
        if (this.div) {
            this.setMap(null);
            this.poly.setMap(null);
            this.poly = null;
            this.firstBtn.removeClass('removeDrawBtn');

            resetMap();
            $j('#selectedPolygon').val('');
            search();
        }
    }
}