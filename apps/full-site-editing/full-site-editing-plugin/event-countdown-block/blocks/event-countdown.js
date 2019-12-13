// Event Countdown Block
// JavaScript that loads on front-end to update the block
( function() {
	// loop through all event countdown blocks on page
	const intervalIds = [];
	const cals = document.getElementsByClassName( 'wp-block-jetpack-event-countdown' );
	for ( let i = 0; i < cals.length; i++ ) {
		const cal = cals[ i ];

		// grab date from event-countdown__date field
		const eventDateElem = cal.getElementsByClassName( 'event-countdown__date' );
		if ( eventDateElem.length < 1 ) {
			continue;
		}

		// parse date into unix time
		const dtstr = eventDateElem[ 0 ].innerHTML;
		const eventTime = new Date( dtstr ).getTime();
		if ( isNaN( eventTime ) ) {
			continue;
		}

		// only start interval if event is in the future
		if ( eventTime - Date.now() > 0 ) {
			intervalIds[ i ] = window.setInterval( updateCountdown, 1000, eventTime, cal, i );
		} else {
			itsHappening( cal );
		}
	}

	// function called by interval to update displayed time
	// Countdown element passed in as the dom node to search
	// within, supporting multiple events per page
	function updateCountdown( ts, elem, id ) {
		const now = Date.now();
		const diff = ts - now;

		if ( diff < 0 ) {
			itsHappening( elem );
			window.clearInterval( intervalIds[ id ] ); // remove interval here
			return;
		}

		// convert diff to seconds
		let rem = Math.round( diff / 1000 );

		const days = Math.floor( rem / ( 24 * 60 * 60 ) );
		rem = rem - days * 24 * 60 * 60;

		const hours = Math.floor( rem / ( 60 * 60 ) );
		rem = rem - hours * 60 * 60;

		const mins = Math.floor( rem / 60 );
		rem = rem - mins * 60;

		const secs = rem;

		elem.getElementsByClassName( 'event-countdown__day' )[ 0 ].innerHTML = days;
		elem.getElementsByClassName( 'event-countdown__hour' )[ 0 ].innerHTML = hours;
		elem.getElementsByClassName( 'event-countdown__minute' )[ 0 ].innerHTML = mins;
		elem.getElementsByClassName( 'event-countdown__second' )[ 0 ].innerHTML = secs;
	}

	// what should we do after the event has passed
	// the majority of views will be well after and
	// not during the transition
	function itsHappening( elem ) {
		const countdown = elem.getElementsByClassName( 'event-countdown__counter' )[ 0 ];
		const fireworks = document.createElement( 'div' );
		elem.getElementsByClassName( 'event-countdown__day' )[ 0 ].innerHTML = 0;
		elem.getElementsByClassName( 'event-countdown__hour' )[ 0 ].innerHTML = 0;
		elem.getElementsByClassName( 'event-countdown__minute' )[ 0 ].innerHTML = 0;
		elem.getElementsByClassName( 'event-countdown__second' )[ 0 ].innerHTML = 0;
		countdown.classList.add( 'event-countdown__counter-stopped' );
		fireworks.className = 'event-countdown__fireworks';
		fireworks.innerHTML =
			"<div class='event-countdown__fireworks-before'></div><div class='event-countdown__fireworks-after'></div>";
		countdown.parentNode.appendChild( fireworks, countdown );
	}
} )();
