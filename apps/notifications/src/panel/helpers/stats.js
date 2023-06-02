export function recordTracksEvent( event, properties ) {
	window._tkq = window._tkq || [];
	window._tkq.push( [ 'recordEvent', event, properties ] );
}
