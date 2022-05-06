import fetch, { BodyInit, HeadersInit, RequestInit } from 'node-fetch';
import { SecretsManager } from './secrets';
import type { AccountCredentials } from './data-helper';

type EndpointVersions = '1' | '1.1' | '1.2' | '1.3';
interface BearerTokenResponse {
	success: string;
	data: {
		bearer_token: string;
		token_links: string[];
	};
}
interface RequestParams {
	method: 'post' | 'get';
	headers?: HeadersInit;
	body?: BodyInit;
}
interface Site {
	ID: string;
	name: string;
	description: string;
	URL: string;
	site_owner: string;
}
interface MySitesResponse {
	sites: Site[];
}

const BEARER_TOKEN_URL = 'https://wordpress.com/wp-login.php?action=login-endpoint';
const REST_API_BASE_URL = 'https://public-api.wordpress.com';

/**
 * Client to interact with the WordPress.com REST API.
 */
export class RestAPIClient {
	readonly credentials: AccountCredentials;
	private bearerToken: string | null;

	/**
	 * Constructs an instance of the API client.
	 */
	constructor( credentials: AccountCredentials ) {
		this.credentials = credentials;
		this.bearerToken = null;
	}

	/**
	 * Returns the bearer token for the user.
	 *
	 * If the token has been previously obtained, this method returns the value.
	 * Otherwise, an API call is made to obtain the bearer token and the resulting value is returned
	 *
	 * @returns {Promise<string>} String representing the bearer token.
	 */
	private async getBearerToken(): Promise< string > {
		if ( this.bearerToken !== null ) {
			return this.bearerToken;
		}

		// Bearer Token generation is done via a URL query param.
		const params = new URLSearchParams();
		params.append( 'username', this.credentials.username );
		params.append( 'password', this.credentials.password );
		params.append( 'client_id', SecretsManager.secrets.calypsoOauthApplication.client_id );
		params.append( 'client_secret', SecretsManager.secrets.calypsoOauthApplication.client_secret );
		params.append( 'get_bearer_token', '1' );

		// Request the bearer token for the user.
		const response: BearerTokenResponse = await this.sendRequest( new URL( BEARER_TOKEN_URL ), {
			method: 'post',
			body: params,
		} );

		this.bearerToken = response.data.bearer_token;
		return this.bearerToken;
	}

	/* Request builder methods */

	/**
	 * Returns the appropriate authorization header.
	 *
	 * @returns {Promise<string>} Authorization header in the requested scheme.
	 * @throws {Error} If a scheme not yet implemented is requested.
	 */
	private async getAuthorizationHeader( scheme: 'bearer' ): Promise< string > {
		if ( scheme === 'bearer' ) {
			return `Bearer ${ await this.getBearerToken() }`;
		}

		throw new Error( 'Unsupported authorization scheme specified.' );
	}

	/**
	 * Returns the formatted Content-Type header string.
	 *
	 * @returns {string} Content-Type header string.
	 */
	private getContentTypeHeader( value: 'json' ): string {
		return `application/${ value }`;
	}

	/**
	 * Returns a fully constructed URL object pointing to the request endpoint.
	 *
	 * @param {EndpointVersions} version Version of the API to use.
	 * @param {string} endpoint REST API path.
	 * @returns {URL} Full URL to the endpoint.
	 */
	private getRequestURL( version: EndpointVersions, endpoint: string ): URL {
		const path = `/rest/v${ version }/${ endpoint }`.replace( /([^:]\/)\/+/g, '$1' );
		return new URL( path, REST_API_BASE_URL );
	}

	/**
	 * Sends the request to the endpoint, then returns the decoded JSON.
	 *
	 * @param {URL} url URL of the endpoint.
	 * @param {RequestParams} params Parameters for the request.
	 * @returns {Promise<any>} Decoded JSON response.
	 */
	private async sendRequest( url: URL, params: RequestParams | URLSearchParams ): Promise< any > {
		const response = await fetch( url, params as RequestInit );
		return response.json();
	}

	/**
	 * Gets the list of users's sites.
	 *
	 * This method returns an array of Site objects, where
	 * each Site object exposes a few key pieces of data from
	 * the response JSON:
	 * 	- ID
	 * 	- name
	 * 	- site description
	 * 	- URL
	 * 	- site owner
	 *
	 * @returns {Site[]} Array of Sites.
	 */
	async getMySites(): Promise< Site[] > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response: MySitesResponse = await this.sendRequest(
			this.getRequestURL( '1.1', '/me/sites' ),
			params
		);

		return response[ 'sites' ];
	}
}
