var birthday_global;

function init(event) {
    birthday_global = new Date();

    var birthDayInput = document.getElementById("birthdate");
    var addEventInput = document.getElementById("addevent");
    var addJsonInput = document.getElementById("eventJson");

    birthDayInput.addEventListener("change", birthdateChangeListener);
    addEventInput.addEventListener("click", eventButtonClickListener);
    addJsonInput.addEventListener("paste", eventJsonListener);

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
    var eventDateInputFrom = document.getElementById("eventdateFrom");
    var eventDateInputTo = document.getElementById("eventdateTo");
    var eventDescriptionInput = document.getElementById("eventdescription");
    var eventColorInput = document.getElementById("eventcolor");

    if (eventDateInputFrom.value != "") {
        var eventDay = eventDateInputFrom.valueAsDate;
        var eventDescription = eventDescriptionInput.value;
        var eventColor = eventColorInput.value;

        if (eventDateInputTo.value != "") {
            var periodEnd = eventDateInputTo.valueAsDate;
            appendPeriodToWeekChart(eventDay, periodEnd, eventDescription, eventColor);
        } else {
            appendEventToWeekChart(eventDay, eventDescription, eventColor);
        }
    }
}

function eventJsonListener(event) {
    var jsonInput = event.target;
    var eventsJson = JSON.parse(jsonInput.value);
    var eventCount = eventsJson.Events.length;

    for (var currentEventId = 0; currentEventId < eventCount; currentEventId++) {
        var eventDate = new Date(eventsJson.Events[currentEventId].Date); // format: yyyy-mm-dd        
        var eventDescription = eventsJson.Events[currentEventId].Description; // text
        var eventColor = eventsJson.Events[currentEventId].Color; // #ffffff, see getEventHTML func (inline = true)
        
        if (eventsJson.Events[currentEventId].EndDate) {
            var eventEndDate = new Date(eventsJson.Events[currentEventId].EndDate);
            appendPeriodToWeekChart(eventDate, eventEndDate, eventDescription, eventColor);
        } else {
            appendEventToWeekChart(eventDate, eventDescription, eventColor);
        }
    }
}

function appendEventToWeekChart(eventDate, eventDescription, eventColor) {
    appendWeekChart( ( weeksElapsedFrom(birthday_global, eventDate) + 1 ), eventDescription, eventColor);    
}

function appendPeriodToWeekChart(startDate, endDate, description, color) {
    var startWeek = weeksElapsedFrom(birthday_global, startDate) + 1;
    var endWeek = weeksElapsedFrom(birthday_global, endDate) + 1;

    for (var currentWeek = startWeek; currentWeek < endWeek; currentWeek++) {
       appendWeekChart(currentWeek, description, color);
    }
}

function appendWeekChart(weekNo, description, color) {
    var currentWeekDivId = "week" + weekNo;
    var weekDiv = document.getElementById(currentWeekDivId);
        
    if (weekDiv == null) {
        weekDiv = document.getElementById("week1");   
    }
    
    appendCurrentWeekEventCounter(weekDiv);
    
    weekDiv.innerHTML += getEventHTML(description, getParamsForEventHTML(true, color, undefined));
}

function appendCurrentWeekEventCounter(weekDiv) {           
    var eventCountForWeek = weekDiv.getElementsByClassName("event").length;
    
    if ( 0 < eventCountForWeek ){
        var eventCountContainer = getElementInsideContainerByClassName(weekDiv, "eventCountForWeek");

        if (eventCountContainer == undefined) {
            weekDiv.innerHTML += getEventCountContainerHTML();
            eventCountContainer = getElementInsideContainerByClassName(weekDiv, "eventCountForWeek");
        }
    
        // limit shown event count up to 9, else show + sign
        eventCountContainer.innerHTML = eventCountForWeek < 9 ? (eventCountForWeek+1) : "+";        
    }
}

function getEventCountContainerHTML() {
    return "<span class=\"eventCountForWeek\"></span>";
}

function getElementInsideContainerByClassName(container, className) {    
    return container.getElementsByClassName(className)[0];    
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

        if (week <= currentWeek) { containerHTML += " spent"; }        
        else { containerHTML += " available"; }

        containerHTML += "\">";
        
        if (isBirthdayWeek(week, birthDay)) {              
            containerHTML += getEventHTML("BirthDay", getParamsForEventHTML(false, undefined, "birthday"));            
        }

        if (week == currentWeek) {
            containerHTML += getEventHTML("Current week", getParamsForEventHTML(false, undefined, "current"));
        }

        containerHTML += "</div>";

        if (week % 52 == 0 && week != 0) {
            containerHTML += "</div>";
            containerHTML += "<div id=\"year\" class=\"year\"><span class=\"yearNo\">" + (week / 52) + "</span>";
        }

        week++;
    }
    return containerHTML;
}

function getParamsForEventHTML(isInline, cssColor, cssClassName) {
    var eventParams = new Object();
    eventParams.isInline = isInline;
    eventParams.inlineStyleColor = cssColor;
    eventParams.cssClassName = cssClassName;
    return eventParams;
}

function isBirthdayWeek(weeksFromBirth, birthDay) {
    // todo: bug with birthday at last week of the year
    
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

function getEventHTML(eventDescription, params) {
    if (params.isInline) {
        return "<span class=\"event\" style=\"background-color:" + params.inlineStyleColor + "\"></span>";
    } else {
        return "<span class=\"event "+params.cssClassName+"\"></span>";
    }
}