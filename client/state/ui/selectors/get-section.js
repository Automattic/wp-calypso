/**
 * Returns the current section.
 *
 * @param  {Object}  state Global state tree
 * @return {Object}        Current section
 */
export default function getSection( state ) {
	return state.ui.section || false;
}
