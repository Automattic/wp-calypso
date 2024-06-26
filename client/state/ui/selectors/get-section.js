import 'calypso/state/ui/init';

/**
 * @typedef {Object} Section
 * @property {string} name - The name of the section
 * @property {string[]} paths - The URL paths of the section
 * @property {string} module - The module path of the section
 * @property {string} group - The group of the section
 *
 * Returns the current section.
 * @param  {Object}  state Global state tree
 * @returns {Section}        Current section
 */
export default function getSection( state ) {
	return state.ui.section || false;
}
