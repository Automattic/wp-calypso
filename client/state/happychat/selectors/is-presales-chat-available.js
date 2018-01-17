/**
 * Returns if presales chat is available.
 * @param   {Object}  state  Global state tree
 * @returns {Boolean}        true, when presales is available
 */
export default function isPresalesChatAvailable( state ) {
	return state.ui.olark.availability.presale;
}
