<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="cms" uri="http://www.5monkeys.se/cms" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="monkey" uri="http://www.5monkeys.se/taglib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<div id="mapWrap"></div>
<div id="minMapButton" class="btn map-control"><i class="fa fa-compress"></i></div>
<div id="maxMapButton" class="btn map-control"><i class="fa fa-expand"></i></div>
<div id="directionsOnBigMap" class="active">
    <div class="showDirectSquare"></div>
    <i class="fa fa-share"></i>
</div>

<c:if test="${displayContactInfo == false}">
    <span class="createNewsletter">
        <span><cms:write path="ad/show/showMap/zoomInMessage" /></span>
        <c:if test="${createNewsletter}">
            <sec:authorize ifNotGranted="customer">
                <a class="blueLink" onclick="ga('send', 'event', 'Annons', 'Klickade pa skapa bevakning under kartan (redan inloggad)'); openLoginPopup('<c:url value="/newsletter/required.do?adId=${ad.id}"/>');" ><cms:write path="ad/show/showMap/createNewsletter"/></a>
            </sec:authorize>
            <sec:authorize ifAnyGranted="customer">
                <a class="blueLink" onclick="ga('send', 'event', 'Annons', 'Klickade pa skapa bevakning under kartan');" href="<c:url value="/newsletter/required.do?adId=${ad.id}"/>" ><cms:write path="ad/show/showMap/createNewsletter"/></a>
            </sec:authorize>
        </c:if>
        <c:if test="${empty createNewsletter || createNewsletter == false}">
            <sec:authorize ifAnyGranted="customer">
                <a class="blueLink" onclick="ga('send', 'event', 'Annons', 'Klickade pa HittaBostadsPaket under kartan (redan inloggad)');" href="<c:url value="/payment/buyAccess.do?id=${ad.id}"/>"><cms:write path="ad/show/showMap/buyPackage"/></a>
            </sec:authorize>
            <sec:authorize ifNotGranted="customer">
                <a class="blueLink" onclick="ga('send', 'event', 'Annons', 'Klickade pa HittaBostadsPaket under kartan'); openLoginPopup('<c:url value="/payment/buyAccess.do?id=${ad.id}"/>');"><cms:write path="ad/show/showMap/buyPackage"/></a>
            </sec:authorize>
        </c:if>
    </span>
</c:if>

<div class="directions-wrapper" style="left: -400px;">
    <div class="top-part-directions">
        <h3 class="title-directions"><cms:write path="map/googleDirections/sidebar/title" /></h3>
        <div id="closeDirections" class="closeDirections"></div>

        <%--Don't change ids of elements, they are used in JS (mapAd.js) --%>
        <div class="travel-modes-wrapper">
            <div id="driving" class="travel-mode-btn car-btn active"><i class="material-icons">directions_car</i></div>
            <div id="transit" class="travel-mode-btn bus-btn"><i class="material-icons">directions_bus</i></div>
            <div id="walking" class="travel-mode-btn feet-btn"><i class="material-icons">directions_run</i></div>
            <div id="bicycling" class="travel-mode-btn cycle-btn"><i class="material-icons">directions_bike</i></div>
        </div>

        <div class="directions-fields-container">

            <div class="fields-wrapper">
                <div class="address-field source-wrapper">
                    <input id="origin-input" class="field-direction" type="text" placeholder="" disabled="disabled" >
                </div>
                <div class="address-field destination-wrapper">
                    <input id="destination-input" class="field-direction"  type="text" placeholder="">
                    <div id="removeAddress" class="removeAddress"></div>
                </div>
            </div>

            <div id="swapRoutesBtn" class="swap-wrapper">
                <i class="fa fa-exchange" aria-hidden="true"></i>
            </div>

        </div>
        <div style="clear: both;"></div>
    </div>
    <c:if test="${displayContactInfo == true}">
        <div id="hide-boxAddress" class="hide-boxAddress">
            <i class="fa fa-chevron-left"></i>
        </div>
    </c:if>


    <div class="direction-details-wrapper">
        <div class="details-content">
            <div id="showFullDetails"><i class="fa fa-chevron-up"></i></div>
            <div id="search-result-wrapper"></div>
        </div>
        <div id="hideDetailsBtn"><i class="fa fa-chevron-up"></i></div>
    </div>
</div>

<c:if test="${displayContactInfo == false}">

    <c:if test="${createNewsletter}">
        <div id="noDirections" class="lightpopup noNewsmail">
            <span><cms:write path="ad/show/showMap/directions" /></span>
            <a class="blueLink" onclick="ga('send', 'event', 'Annons', 'Klickade pa skapa bevakning under kartan');" href="<c:url value="/newsletter/required.do?adId=${ad.id}"/>" ><cms:write path="ad/show/showMap/createNewsletter"/></a>
            <i class="close" onclick="closeLightPopup(this);"><i class="fas fa-times"></i></i>
        </div>

        <div id="noZoom" class="lightpopup noNewsmail">
            <span><cms:write path="ad/show/showMap/zoomInMessage" /></span>
            <a class="blueLink" onclick="ga('send', 'event', 'Annons', 'Klickade pa skapa bevakning under kartan');" href="<c:url value="/newsletter/required.do?adId=${ad.id}"/>" ><cms:write path="ad/show/showMap/createNewsletter"/></a>
            <i class="close" onclick="closeLightPopup(this);"><i class="fas fa-times"></i></i>
        </div>
    </c:if>

    <c:if test="${empty createNewsletter || createNewsletter == false}">
        <div id="noDirections" class="lightpopup noAccess">
            <cms:write path="search/result/map/noAccess/noDirection/text" />
            <i class="close" onclick="closeLightPopup(this);"><i class="fas fa-times"></i></i>
        </div>
        <div id="noZoom" class="lightpopup noAccess">
            <cms:write path="search/result/map/nozoom/text" />
            <i class="close" onclick="closeLightPopup(this);"><i class="fas fa-times"></i></i>
        </div>
    </c:if>
</c:if>

