import { get } from 'lodash';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';

/**
 * Returns a specific setting for the specified site ID
 *
 * @param  {Object} state   Global state tree
 * @param  {number} siteId  Site ID
 * @param  {string} setting Setting name
 * @returns {Object}         Site setting
 */
export default function getSiteSetting( state, siteId, setting ) {
	return get( getSiteSettings( state, siteId ), [ setting ], null );
}
