/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import getSectionGroup from './get-section-group';

/**
 * Returns true if the current section is a site-specific section.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       Whether current section is site-specific
 */
export default function isSiteSection( state ) {
	return includes( [ 'sites', 'editor', 'gutenberg' ], getSectionGroup( state ) );
}
