/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getJetpackSettings } from 'state/selectors';

/**
 * Returns a certain Jetpack setting on a specified site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   The ID of the site we're querying
 * @param  {String}  setting  Name of the setting
 * @return {*}                Value of the Jetpack setting
 */
export default function getJetpackSetting( state, siteId, setting ) {
	return get( getJetpackSettings( state, siteId ), [ setting ], null );
}
