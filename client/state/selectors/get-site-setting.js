/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteSettings } from 'state/site-settings/selectors';

/**
 * Returns a specific setting for the specified site ID
 *
 * @param  {Object} state   Global state tree
 * @param  {Number} siteId  Site ID
 * @param  {String} setting Setting name
 * @return {Object}         Site setting
 */
export default function getSiteSetting( state, siteId, setting ) {
	return get( getSiteSettings( state, siteId ), [ setting ], null );
}
