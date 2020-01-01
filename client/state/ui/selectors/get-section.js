/**
 * Returns the current section.
 *
 * @param  {object}  state Global state tree
 * @return {object}        Current section
 */
export default function getSection( state ) {
	return state.ui.section || false;
}
