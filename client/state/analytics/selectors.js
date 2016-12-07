
/**
 * Checks if an event has already been recorded
 *
 * @param  {Object}  state   Global state tree
 * @param  {Boolean} eventId Event ID
 * @return {String}          Whether this event has been recorded or not
 */
export function hasAlreadyBeenRecorded( state, eventId ) {
	return !! state.analytics[ eventId ];
}
