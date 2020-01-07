/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Gets the OAuth2 client data.
 *
 * @param  {object}   state  Global state tree
 * @param  {number} clientId OAuth2 Client ID
 * @returns {object}          OAuth2 client data
 */
export const getOAuth2Client = ( state, clientId ) => {
	return get( state, `oauth2Clients[${ clientId }]`, null );
};
