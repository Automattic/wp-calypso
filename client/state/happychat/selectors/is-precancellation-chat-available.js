/**
 * Returns if precancellation chat is available.
 * @param   {Object}  state  Global state tree
 * @returns {Boolean}        true, when precancellation is available
 */
export default function isPrecancellationChatAvailable( state ) {
	return state.ui.olark.availability.precancellation;
}
