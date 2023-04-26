import 'calypso/state/ui/init';

/**
 * Returns the current section.
 *
 * @param  {Object}  state Global state tree
 * @returns {Object}        Current section
 */
export default function getSection( state ) {
	return state.ui.section || false;
}
