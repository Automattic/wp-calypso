/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

/**
 * Returns a specific setting for the specified site ID
 *
 * @param  {object} state   Global state tree
 * @param  {number} siteId  Site ID
 * @param  {string} setting Setting name
 * @returns {object}         Site setting
 */
export default function getSiteSetting( state, siteId, setting ) {
	return get( getSiteSettings( state, siteId ), [ setting ], null );
}
