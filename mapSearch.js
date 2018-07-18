import {
    GMap
} from "../index";

// draggable for ipads and iphones
$j.fn.dragg = function() {
    let offset = null;
    let start = function(e) {
        let orig = e.originalEvent;
        let pos = $j(this).position();
        offset = {
            x: orig.changedTouches[0].pageX - pos.left,
            y: orig.changedTouches[0].pageY - pos.top
        };
    };
    let moveMe = function(e) {
        e.preventDefault();
        let orig = e.originalEvent;
        $j(this).css({
            position: 'absolute',
            top: orig.changedTouches[0].pageY - offset.y,
            left: orig.changedTouches[0].pageX - offset.x
        });
    };
    this.bind("touchstart", start);
    this.bind("touchmove", moveMe);
};

export function showMap() {
    window.updateMapBounds = true;
    $j("#showMapResults").val("true");
    $j('.sortingLinks').removeClass("active");
    if ($j("#openSortingLinks").hasClass("active")) {
        $j("#openSortingLinks").removeClass("active");
    }
    window.map = new GMap("mapResults");

}

export function maxMap() {
    let map = window.map.getMap();

    $j("#maxMapButton").hide();
    $j("#minMapButton").show();
    $j("#mapResults").addClass("full");
    $j("#radiusSearch").addClass("full");
    $j("#mapResultsNoZoomBottom").addClass("full");
    $j(".containerLeft.MAP").addClass("full");

    let center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
}

export function minMap() {
    let map = window.map.getMap();

    $j("#minMapButton").hide();
    $j("#maxMapButton").show();
    $j("#radiusSearch").removeClass("full");
    $j("#mapResults").removeClass("full");
    $j("#mapResultsNoZoomBottom").removeClass("full");
    $j(".containerLeft.MAP").removeClass("full");

    let center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
}

export function hideMap() {
    $j("#showMapResults").val("false");
    $j("#radius").val('');
    $j("#radiusSearch").removeClass("active");
    $j("#selectedCriterias .group.municipalities").removeClass("disabled");
    closeAdInfo();
}

export function closeAdInfo() {
    $j("#adInfo").hide();
}

export function closeLightPopup(button) {
    $j.cookie("hideBuyAccessPopup", true, { path: '/' });
    $j(button).parents('.lightpopup').remove();
}

export function getMaxZoom() {
    let maxZoom = 12;
    if (hasAccess)
        maxZoom = 21;
    return maxZoom;
}

export function showFreeDrawPopup() {
    const modalWindow = $j("#freeDraw-modal");

    if (localStorage.getItem('isFreeDrawPopupClosed') !== 'closed') {
        if (sessionStorage.getItem('isFreeDrawPopupClosed') !== 'closed') {

            modalWindow.modal();

            modalWindow.on('shown.bs.modal', () => {
                $j("#freeHandDrawBtn").addClass("highlighted");
            });
            modalWindow.on('hidden.bs.modal', () => {
                $j("#freeHandDrawBtn").removeClass("highlighted");
            });

            sessionStorage.setItem('isFreeDrawPopupClosed', 'closed');
        }
    }
}

export function closeFreeDrawPopup() {
    const modalWindow = $j("#freeDraw-modal");
    localStorage.setItem('isFreeDrawPopupClosed', 'closed');
    modalWindow.modal('hide');
}



