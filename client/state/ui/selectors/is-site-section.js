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
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether current section is site-specific
 */
export default function isSiteSection( state ) {
	return includes( [ 'sites', 'editor', 'gutenberg' ], getSectionGroup( state ) );
}
