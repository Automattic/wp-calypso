const surfaces = [];

/**
 * Adds a `surface` property, naming where the notifications are shown, to every event recorded
 * until the returned function is called. The surface added last wins, so a panel opened over the
 * full page names the panel.
 * @param {string} surface The place the notifications are shown, such as `dashboard_panel`.
 * @returns {() => void} Stops adding this surface.
 */
export function addTracksSurface( surface ) {
	const entry = { surface };
	surfaces.push( entry );

	return () => {
		const index = surfaces.indexOf( entry );
		if ( index !== -1 ) {
			surfaces.splice( index, 1 );
		}
	};
}

/**
 * Returns the surface the next event will name. Read it when a request starts, and pass it with the event
 * recorded when the request returns: by then the panel may have closed or opened.
 * @returns {string | undefined} The surface added last.
 */
export function getTracksSurface() {
	return surfaces[ surfaces.length - 1 ]?.surface;
}

/**
 * Records a Tracks event, naming the surface added last unless the properties name one.
 * @param {string} event The event name.
 * @param {Object} [properties] The event's properties.
 */
export function recordTracksEvent( event, properties = {} ) {
	const { surface = getTracksSurface(), ...rest } = properties;
	window._tkq = window._tkq || [];
	window._tkq.push( [ 'recordEvent', event, surface ? { ...rest, surface } : rest ] );
}
