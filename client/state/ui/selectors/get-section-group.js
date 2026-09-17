import getSection from './get-section';

/**
 * Returns the current section group name.
 * @param  {Object}  state Global state tree
 * @returns {?string}       Current section group name
 */
export default function getSectionGroup( state ) {
	return getSection( state )?.group ?? null;
}
