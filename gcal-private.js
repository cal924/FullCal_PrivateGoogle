var clientId = 'CLIENT_ID';
var apiKey = 'API_KEY';
var scopes = 'https://www.googleapis.com/auth/calendar';
var events = [];
var calendarIds = [];
var calGot = false;
var eventGot = 0;

function handleClientLoad() {
	gapi.client.setApiKey(apiKey);
	window.setTimeout(checkAuth, 1);
}

function checkAuth(){
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult){
	var authorizeButton = document.getElementById('authorize-button');

	if (authResult && !authResult.error){
		authorizeButton.style.visibility = 'hidden' ;
		makeApiCall();
	} else {
		authorizeButton.style.visibility = '';
		authorizeButton.onclick = handleAuthClick;
		GeneratePublicCalendar();
	}
}

function handleAuthClick(event) {
	//Cannot set a token like the commented part
	/*gapi.auth.setToken({
	    access_token: "ya29.CjAyA24cN-CTd208GXOKx-KBuVVCOtoF53fWWHCehyU97Iirek8-WEZku7nBcF-4JTE"
	});
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);*/
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
	return false;	
}

function getCalendars() {
	gapi.client.load('calendar', 'v3', function() {
		var request = gapi.client.calendar.calendarList.list({});
		request.execute(function(resp) {
			if (!resp.error) {
				for (var i = 0 ; i < resp.items.length ; i++){
					calendarIds.push(resp.items[i].id);
				}
			}
			calGot = true;
		});
	});
}

function getEvents() {
	if (calGot){
		for (var i = 0 ; i < calendarIds.length ; i++){
			var request2 = gapi.client.calendar.events.list({
				calendarId : calendarIds[i]
			});
			request2.execute(function(resp) {
				if (!resp.error) {
					if (resp.result.items) {
						$.each(resp.result.items, function(i, entry) {
							events.push({
								id: entry.id,
								title: entry.summary,
								start: entry.start.dateTime || entry.start.date,
								end: entry.end.dateTime || entry.end.date,
								url: entry.htmlLink,
								location: entry.location,
								description: entry.description
							});
						});
					}
				}
				eventGot++;
			});
		}
	} else {
		setTimeout(getEvents, 250);
	}
}

function buildCalendar() {
	if (calGot && eventGot >= calendarIds.length){
		$('#calendar').fullCalendar({
			events: events
		});
	} else {
		setTimeout(buildCalendar, 250);
	}
}

function getAllEvents(){
	getCalendars();
	getEvents();
	buildCalendar();
}

function makeApiCall() {
	getAllEvents();
	alert(gapi.auth.getToken());
	console.log(gapi.auth.getToken())
}

function GeneratePublicCalendar(){
	$('#calendar').fullCalendar({
		googleCalendarApiKey: apiKey
	})
}
