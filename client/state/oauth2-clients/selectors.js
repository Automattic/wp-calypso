/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/***
 * Gets the OAuth2 client data.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number} clientId OAuth2 Client ID
 * @return {Object}          OAuth2 client data
 */
export const getOAuth2Client = ( state, clientId ) => {
	return get( state, `oauth2Clients[${ clientId }]`, null );
};
