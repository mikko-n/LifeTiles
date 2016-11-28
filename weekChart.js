var birthday_global;

function init(event) {
    birthday_global = new Date();

    var birthDayInput = document.getElementById("birthdate");
    var addEventInput = document.getElementById("addevent");

    birthDayInput.addEventListener("change", birthdateChangeListener, false);
    addEventInput.addEventListener("click", eventButtonClickListener, false);

    document.getElementById("container").innerHTML = printWeekChart();
}

function birthdateChangeListener(event) {
    var birthDayInput = event.target;

    if (birthDayInput.value != "") {
        birthday_global = birthDayInput.valueAsDate;
    }

    document.getElementById("container").innerHTML = printWeekChart(birthday_global);
}

function eventButtonClickListener(event) {
    var eventDateInput = document.getElementById("eventdate");
    var eventDescriptionInput = document.getElementById("eventdescription");
    var eventColorInput = document.getElementById("eventcolor");

    if (eventDateInput.value != "") {
        var eventDay = eventDateInput.valueAsDate;
        var eventDescription = eventDescriptionInput.value;
        var eventColor = eventColorInput.value;
        var weekDivId = "week" + (weeksElapsedFrom(birthday_global, eventDay) + 1);
        var weekDiv = document.getElementById(weekDivId);
        var evntHtml = getEventHTML(eventDay, eventDescription, eventColor);

        weekDiv.innerHTML = evntHtml;
        event.cancelBubble();
        event.stopPropagation();
    }

}

function printWeekChart(birthDay) {
    var week = 1;
    if (birthDay == undefined) {
        var birthDay = new Date();
    }

    var lastBirthDay = new Date(birthDay);
    lastBirthDay.setFullYear(birthDay.getFullYear() + 90);

    var theEnd = weeksElapsedFrom(birthDay, lastBirthDay);
    var currentWeek = weeksElapsedFrom(birthDay, new Date());
    var containerHTML = "";

    containerHTML += "<div id=\"year\" class=\"year\"><span class=\"yearNo\">0</span>";

    while (week < theEnd) {
        containerHTML += "<div id=\"week" + week + "\" class=\"week";

        if (week < currentWeek) { containerHTML += " spent"; }
        else if (week == currentWeek) { containerHTML += " current"; }
        else { containerHTML += " available"; }

        if (isBirthdayWeek(week, birthDay)) {
            // console.log("week: "+week);
            containerHTML += " birthday";
        }

        containerHTML += "\"></div>";

        if (week % 52 == 0 && week != 0) {
            containerHTML += "</div>";
            containerHTML += "<div id=\"year\" class=\"year\"><span class=\"yearNo\">" + (week / 52) + "</span>";
        }

        week++;
    }
    return containerHTML;
}

function isBirthdayWeek(weeksFromBirth, birthDay) {
    // special case: week 1
    if (weeksFromBirth == 1) {
        return true;
    }

    var millisFromBirth = weeksFromBirth * 604800000; // = 1000*60*60*24*7

    // last day of current week           
    var lastDayOfCurrentWeek = new Date(birthDay.getTime() + millisFromBirth);

    // birthday for current year, copy var to not change outer scope bday
    var birthDate = new Date(birthDay);
    birthDate.setFullYear(lastDayOfCurrentWeek.getFullYear());

    // is birthday week?
    // -birthday at or before current week's first day
    // -time difference to bDay less than 6 days
    if (birthDate <= lastDayOfCurrentWeek) {
        var bdayDistanceMillis = (lastDayOfCurrentWeek - birthDate);
        var distanceDays = (bdayDistanceMillis - 10) / 86400000; // =1000/60/60/24;
        return distanceDays < 6;
    }
    return false;
}

function weeksElapsedFrom(beginDate, toDate) {
    return Math.round((toDate - beginDate) / 604800000); // =1000/60/60/24/7
}

function getEventHTML(eventDate, eventDescription, eventColor) {
    return "<span class=\"event\" style=\"background-color:" + eventColor + "\"></span>";
}