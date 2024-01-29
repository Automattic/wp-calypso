/**
 * External dependencies
 */
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import { JWT_TOKEN_EXPIRATION_TIME, JWT_TOKEN_ID } from '../../constants';
import { RequestTokenOptions, TokenDataProps, TokenDataEndpointResponseProps } from '../../types';
import wpcomLimitedRequest from './wpcom-limited-request';

const debug = debugFactory( 'jetpack-ai-calypso:request-token' );

/**
 * Request a token from the Jetpack site.
 * @param {RequestTokenOptions} options - Options
 * @returns {Promise<TokenDataProps>}     The token and the blogId
 */
export async function requestJwt( {
	siteDetails,
	expirationTime,
}: RequestTokenOptions = {} ): Promise< TokenDataProps > {
	// Default values
	const siteId = String( siteDetails?.ID || window.JP_CONNECTION_INITIAL_STATE.siteSuffix );
	expirationTime = expirationTime || JWT_TOKEN_EXPIRATION_TIME;

	// Trying to pick the token from localStorage
	const token = localStorage.getItem( JWT_TOKEN_ID );
	let tokenData: TokenDataProps | null = null;

	if ( token ) {
		try {
			tokenData = JSON.parse( token );
		} catch ( err ) {
			debug( 'Error parsing token', err );
		}
	}

	if ( tokenData && tokenData?.expire > Date.now() ) {
		debug( 'Using cached token' );
		return tokenData;
	}

	const data: TokenDataEndpointResponseProps = await wpcomLimitedRequest( {
		apiNamespace: 'wpcom/v2',
		path: '/sites/' + siteId + '/jetpack-openai-query/jwt',
		method: 'POST',
	} );

	const newTokenData = {
		token: data.token,

		blogId: data.blog_id ?? siteId,

		/**
		 * Let's expire the token in 2 minutes
		 */
		expire: Date.now() + expirationTime,
	};

	// Store the token in localStorage
	debug( 'Storing new token' );
	localStorage.setItem( JWT_TOKEN_ID, JSON.stringify( newTokenData ) );

	return newTokenData;
}
