/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getOAuth2Client } from 'state/oauth2-clients/selectors';

/**
 * Returns the ID of the current OAuth2 client.
 *
 * @param  {Object}  state  Global state tree
 * @return {?Number}        Current OAuth2 client ID
 */
export function getCurrentOAuth2ClientId( state ) {
	return get( state, 'ui.oauth2Clients.currentClientId' );
}

/***
 * Gets the OAuth2 client data.
 *
 * @param  {Object}   state  Global state tree
 * @return {Object}          OAuth2 client data
 */
export const getCurrentOAuth2Client = state => {
	const currentClientId = getCurrentOAuth2ClientId( state );

	if ( ! currentClientId ) {
		return null;
	}

	return getOAuth2Client( state, currentClientId );
};

/***
 * Determines if the OAuth2 layout should be used.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Whether the OAuth2 layout should be used.
 */
export const showOAuth2Layout = state => !! getCurrentOAuth2ClientId( state );
