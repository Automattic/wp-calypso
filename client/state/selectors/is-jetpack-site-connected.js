/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getJetpackConnectionStatus } from './';

/**
 * Returns true if we the Jetpack site is connected. False otherwise.
 * Returns null if the site is unknown, or there is no information yet.
 *
 * @param  {Object}   state    Global state tree
 * @param  {Number}   siteId   The ID of the site we're querying
 * @return {?Boolean}          Whether the site is connected.
 */
export default function isJetpackSiteConnected( state, siteId ) {
	return get( getJetpackConnectionStatus( state, siteId ), [ 'isActive' ], null );
}
