/**
 * External dependencies
 */
import { get } from 'lodash';

/***
 * Gets the OAuth2 client data.
 *
 * @param  {Object}   state  Global state tree
 * @return {Object}          OAuth2 client data
 */
export const getOAuth2ClientData = ( state ) => {
	const currentClientId = get( state, 'ui.oauth2Clients.currentClientId', null );

	if ( ! currentClientId ) {
		return null;
	}

	return get( state, 'ui.oauth2Clients.clients', {} )[ currentClientId ];
};

/***
 * Determines if the OAuth2 layout should be used.
 *
 * @param  {Object}   state  Global state tree
 * @return {Boolean}         Whether the OAuth2 layout should be used.
 */
export const showOAuth2Layout = ( state ) => !! get( state, 'ui.oauth2Clients.currentClientId', null );
