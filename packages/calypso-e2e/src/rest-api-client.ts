import fetch, { BodyInit, HeadersInit, RequestInit } from 'node-fetch';
import { SecretsManager } from './secrets';
import type { AccountCredentials } from './data-helper';

interface AccountClosureDetails {
	userID: number;
	username: string;
	email: string;
}

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
	ID: number;
	name: string;
	description: string;
	URL: string;
	site_owner: number;
}
interface AllSitesResponse {
	sites: Site[];
}
interface CalypsoPreferencesResponse {
	calypso_preferences: {
		recentSites: number[];
	};
}
interface MyAccountInformationResponse {
	ID: number;
	username: string;
	email: string;
}
export interface NewUserResponse {
	code: number;
	body: {
		success: boolean;
		user_id: number;
		username: string;
		bearer_token: string;
	};
}

const BEARER_TOKEN_URL = 'https://wordpress.com/wp-login.php?action=login-endpoint';
const REST_API_BASE_URL = 'https://public-api.wordpress.com';

/**
 * Client to interact with the WordPress.com REST API.
 *
 * Each instance of the RestAPIClient represents a specific user,
 * represented by the credentials and bearer token.
 */
export class RestAPIClient {
	readonly credentials: AccountCredentials;
	private bearerToken: string | null;

	/**
	 * Constructs an instance of the API client.
	 */
	constructor( credentials: AccountCredentials, bearerToken?: string ) {
		this.credentials = credentials;
		this.bearerToken = bearerToken ? bearerToken : null;
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

	/* Sites */

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
	 * @returns {Promise<AllSitesResponse} JSON array of sites.
	 */
	async getAllSites(): Promise< AllSitesResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		return await this.sendRequest( this.getRequestURL( '1.1', '/me/sites' ), params );
	}

	/* Me */

	/**
	 * Returns the account information for the user authenticated
	 * via the bearer token.
	 *
	 * @returns {Promise<MyAccountInformationResponse>} Response containing user details.
	 */
	async getMyAccountInformation(): Promise< MyAccountInformationResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		return await this.sendRequest( this.getRequestURL( '1.1', '/me' ), params );
	}

	/**
	 * Closes the account.
	 *
	 * Prior to the account being closed, this method performs
	 * multiple checks to ensure the operation is safe and that
	 * the correct account is being closed.
	 *
	 * The userID, username and email of the account that is
	 * authenticated via the bearer token is checked against the
	 * supplied parameters.
	 *
	 * @returns {Promise<boolean>} True if account closure was successful. False otherwise.
	 */
	async closeAccount(
		expectedAccountDetails: AccountClosureDetails
	): Promise< { success: boolean } > {
		const accountInformation = await this.getMyAccountInformation();

		// Multiple guards to ensure we are operating on the
		// intended account.
		// If at any point the validation fails the procedure is
		// aborted.

		// This portion validates whether the user represented by the
		// instance of the RestAPIClient is in fact a test user.
		if ( ! accountInformation.email.includes( 'mailosaur' ) ) {
			console.warn(
				'Aborting account closure: email address provided is not for an e2e test user.'
			);
			return { success: false };
		}

		if ( ! accountInformation.username.includes( 'e2eflowtesting' ) ) {
			console.warn( 'Aborting account closure: username is not for a test user.' );
			return { success: false };
		}

		// This portion validates that supplied account details match
		// the user represented by the instance of RestAPIClient.
		if ( expectedAccountDetails.userID !== accountInformation.ID ) {
			console.warn(
				`Failed to close account: target account user ID did not match.\nExpected: ${ accountInformation.ID }, Got: ${ expectedAccountDetails.userID }`
			);
			return { success: false };
		}

		if ( expectedAccountDetails.username !== accountInformation.username ) {
			console.warn(
				`Failed to close account: target account username did not match.\nExpected: ${ accountInformation.username }, Got: ${ expectedAccountDetails.username }`
			);
			return { success: false };
		}

		if ( expectedAccountDetails.email !== accountInformation.email ) {
			console.warn(
				`Failed to close account: target account email did not match.\nExpected: ${ accountInformation.email }, Got: ${ expectedAccountDetails.email }`
			);
			return { success: false };
		}

		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		return await this.sendRequest( this.getRequestURL( '1.1', '/me/account/close' ), params );
	}

	/**
	 * Returns Calypso preferences for the user.
	 *
	 * @returns {Promise<CalypsoPreferencesResponse>} JSON response containing Calypso preferences.
	 */
	async getCalypsoPreferences(): Promise< CalypsoPreferencesResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		return await this.sendRequest( this.getRequestURL( '1.1', '/me/preferences' ), params );
	}
}
