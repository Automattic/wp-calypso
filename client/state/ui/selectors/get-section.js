/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

/**
 * Returns the current section.
 *
 * @param  {object}  state Global state tree
 * @returns {object}        Current section
 */
export default function getSection( state ) {
	return state.ui.section || false;
}
