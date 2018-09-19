import {
    initDesktopSlider,
    openCreditLink,
    DetailsPopover,
    showCarouselControl,

    isScrolledIntoView,
    initChartStatistics
} from "../../component/ad/showRental/index";

import {CAROUSEL} from "../../component/carousels/carousel";
import {PaymentForm} from "../../component/ad/showRental/PaymentForm";
import {handleSearchHistory} from "../../component/search/searchHistory";
import {Map} from "../../component/ad/showRental/Map";

import {isMobile} from "../../component/shared/common/commonFunctionality";

$j.get("/stats/count.do?adId=" + adId + "&ts=" + (new Date()).getTime());
$j.post('/stats/ad/count.do', {adId: adId}).done((data)=> {
    setDurationByTypeOfAd('/stats/ad/count.do', data);
});

$j(window).load(()=> {
    $j("#sourcePopup").dialog({
        modal: true,
        resizable: false,
        draggable: false,
        autoOpen: false,
        width: 300
    });

    $j('#homeSource').click(function(){
        $j('#sourcePopup').dialog("open");
    });

    $j('a.openContactLink').hover(function() {
        $j('ul.contactInfoList.hiddenContact').toggleClass("on", true);
    }, function(){
        $j('ul.contactInfoList.hiddenContact').toggleClass("on", false);
    });

    if (!isMobile.any()) {
        initDesktopSlider();
    }

    $j('#slider .item img').each(function(i) {
        $j(this).on('click', function() {
            if (isMobile.any()) {
                if(jQuery().itemslide) {
                    mobileSliderClickListener(i);
                }
            } else {
                $j("#bigSliderLinks a").get(i).click();
            }
        });
    });
});

$j(document).ready(()=> {
    const winWidth = $j(window).width();
    let isChartVisible = false;
    let chartElement = $j('#myChart');

    handleSearchHistory();

    $j(window).on("resize", ()=> {
        const detailsBoxHeight = $j('.featuresBox').height();
        if(detailsBoxHeight > 347) {
            $j('.mapBox').height(detailsBoxHeight);
        }
    }).resize();

    $j("#readMoreSubscriptionLink").colorbox({
        inline:true,
        title:'Abonnemang',
        initialWidth: function() { return $j(window).width() > 767 ? '70%' : '90%'; },
        initialHeight: function() { return $j(window).width() > 767 ? 650 : '90%'; },
        height: function() { return $j(window).width() > 767 ? 650 : '90%'; },
        width: function() { return $j(window).width() > 767 ? '70%' : '90%'; },
        opacity:"0.3"
    });

    $j.when($j('#slider').carousel({ interval: false })).done(function() {
        showCarouselControl();
    });

    if (chartElement.length > 0) {
        $j(window).scroll(()=> {
            if (isScrolledIntoView('#myChart')) {
                if (isChartVisible) { return; }
                isChartVisible = true;
                initChartStatistics();
            }
        });
    }
    $j('.room .questionMark').popover({
        trigger:'click',
        content: statisticsExpain.rooms,
        placement: 'top'
    });
    $j('.space .questionMark').popover({
        trigger:'click',
        content: statisticsExpain.space,
        placement: 'top'
    });

    CAROUSEL.initRecommendations();
    CAROUSEL.initBlog();

    if(winWidth < 1024) {
        $j('#descriptionTab').removeClass('auto');
        $j('#descriptionTabArrow').removeClass('open');
    }

    if(winWidth < 768) {
        $j('.author-rights').html('icons from <a href="http://www.flaticon.com/" style="color:#085394">www.flaticon.com</a>');
    }

    if (winWidth > 1030) {
        DetailsPopover.initForLargeText();
        DetailsPopover.closeListener();
    } else {
        DetailsPopover.initForLargeTextMobile();
    }

    $j('#showModal').on('click', function () {
        $j('#modal-showAd').modal();
    });

    $j('.validAd').on('click', function () {
        $j('#modal-validated').modal();
    });

    $j("#goToAdtraction").on("click", ()=> {
        openCreditLink();
    });

    $j("#submitPaymentBtn").on("click", ()=> {
        PaymentForm.submitPayment();
    });
    $j(".linkPayment").on("click", ()=> {
        PaymentForm.redirectToPayment();
    });

    $j.get(`/ajax/showAdSimilarResults.do?id=${adId}`, (data)=> {
        $j('#similarResults').html(data);
        CAROUSEL.initSimilarAds();
    });

    let acceptTerms = getParameterByName('acceptTerms');
    if (acceptTerms !== null) {
        if (acceptTerms === 'false' && !$j('#acceptSubscriptionAgreement').attr('checked')) {
            showAcceptTerms();
        } else if (acceptTerms === 'true') {
            $j('#acceptSubscriptionAgreement').attr('checked', true);
        }
    }

    if (myLngLat) {
        const map = new Map("mapWrap");
        /*const urlGooglePlaces = `/ajax/poi/list.do?id=A${adId}&type=store&type=restaurant&type=transit_station&type=school`;
        window.gPlaces = null;

        AJAX.GET(urlGooglePlaces).then(tablePlaces,  error => console.log(`free search - status: ${error}`));

        if (displayContacts) {
            AJAX.GET(urlGooglePlaces).then( (data)=> {
                    window.gPlaces = new GPlacesMap(map, data);
                },
                error => console.log(`free search - status: ${error}`)
            );
        }
        const gDirections = new GDirections(map);


        $j("#directionsOnBigMap").on("click", ()=> {
            $j('.top-nav-inner').removeClass('scrolledNav');
            map.maxMap();
            gDirections.showAddressPanelOrPopup();
        });*/

        if(winWidth < 767) {
            $j("#showMapMobile").on("click", ()=> {
                $j(".mapBox").show().addClass("fullMap");
                $j("#minMapButton").show();
                map.maxMap();
            });

            $j("#minMapButton").on("click", ()=> {
                $j(".mapBox").hide().removeClass("fullMap");
                $j(".top-nav-inner").removeClass("scrolledNav");
            });
        }
    }

});