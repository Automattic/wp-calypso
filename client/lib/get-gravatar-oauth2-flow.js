import { initialClientsData } from 'calypso/state/oauth2-clients/reducer';

/**
 * Get the OAuth2 flow name for Gravatar powered clients.
 * @param {Object} oauth2Client The OAuth2 client object.
 * @returns {string} The OAuth2 flow name.
 */
export default function getGravatarOAuth2Flow( oauth2Client ) {
	if ( oauth2Client.name ) {
		return oauth2Client.name;
	}

	// If the client is not in the initial data, use the `source` as the name.
	return initialClientsData[ oauth2Client.id ]?.name ?? oauth2Client.source;
}
