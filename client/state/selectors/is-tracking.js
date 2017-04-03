/**
 * Returns true if tracking is enabled
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether tracking is enabled
 */

export default function isTracking( state ) {
	return state.isTracking;
}
