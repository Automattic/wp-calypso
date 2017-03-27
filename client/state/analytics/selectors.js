export function isTracking( state ) {
	return ( state.application.continuousTracking === 'TRACKING' );
}

export function isNotTracking( state ) {
	return ( state.application.continuousTracking === 'NOT_TRACKING' );
}
