import { get } from 'lodash';
import getSection from './get-section';

/**
 * Returns the current section name.
 * @param  {Object}  state Global state tree
 * @returns {?string}       Current section name
 */
export default function getSectionName( state ) {
	/**
	 * The section name is stored in two places; in its own reducer and inside `section` object state.
	 * The former is loaded synchronously, the latter is loaded asynchronously.
	 * Some UI decisions depend on the sectionName and having it available synchronously is useful to prevent UI flicker.
	 *
	 * Nonetheless, section.name should be the source of truth. So we only use sectionName as a fallback until the section is loaded.
	 */
	const sectionName = state?.ui?.sectionName ?? null;
	return get( getSection( state ), 'name', sectionName );
}
