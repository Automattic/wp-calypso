import getSection from './get-section';

/**
 * Returns the current section name.
 * @param  {Object}  state Global state tree
 * @returns {?string}       Current section name
 */
export default function getSectionName( state ) {
	return getSection( state )?.name ?? null;
}
