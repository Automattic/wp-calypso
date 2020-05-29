/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';

/**
 * Checks if a site is a white glove purchase
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if the site is a white glove purchase, otherwise false
 */
export default function isSiteWhiteGlove( state, siteId ) {
	const site = getRawSite( state, siteId );
	return get( site, 'is_white_glove', false );
}
