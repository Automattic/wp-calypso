/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getJetpackSettings from 'calypso/state/selectors/get-jetpack-settings';

/**
 * Returns a certain Jetpack setting on a specified site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   The ID of the site we're querying
 * @param  {string}  setting  Name of the setting
 * @returns {*}                Value of the Jetpack setting
 */
export default function getJetpackSetting( state, siteId, setting ) {
	return get( getJetpackSettings( state, siteId ), [ setting ], null );
}
