import 'calypso/state/oauth2-clients/init';

/**
 * Gets the OAuth2 client data.
 *
 * @param  {Object}   state  Global state tree
 * @param  {number} clientId OAuth2 Client ID
 * @returns {Object}          OAuth2 client data
 */
export const getOAuth2Client = ( state, clientId ) => {
	return state.oauth2Clients.clients[ clientId ] ?? null;
};
