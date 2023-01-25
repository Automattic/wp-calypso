import 'calypso/state/ui/init';

/**
 * Returns whether a section is loading.
 *
 * @param  {Object}  state Global state tree
 * @returns {boolean}       Whether the section is loading
 */
export default function isSectionLoading( state ) {
	return state.ui.isSectionLoading;
}
