/**
 * Internal dependencies
 */
import 'calypso/state/oauth2-clients/init';

/**
 * Gets the OAuth2 client data.
 *
 * @param  {object}   state  Global state tree
 * @param  {number} clientId OAuth2 Client ID
 * @returns {object}          OAuth2 client data
 */
export const getOAuth2Client = ( state, clientId ) => {
	return state.oauth2Clients.clients[ clientId ] ?? null;
};
