import fetch, { BodyInit, HeadersInit, RequestInit } from 'node-fetch';

type EndpointVersions = '1' | '1.1' | '1.2' | '1.3';
type RequestParams = {
	method: 'post' | 'get';
	headers: HeadersInit;
	body?: BodyInit;
};

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

const BASE_URL = 'https://public-api.wordpress.com';

/**
 * Client to interact with the WordPress.com REST API.
 */
export class RestAPIClient {
	readonly bearerToken: string;

	/**
	 * Constructs an instance of the API client.
	 */
	constructor( bearerToken: string ) {
		this.bearerToken = bearerToken;
	}

	/* Request builder methods */

	/**
	 * Returns the appropriate authorization header.
	 *
	 * @returns {string} Authorization header in the requested scheme.
	 * @throws {Error} If a scheme not yet implemented is requested.
	 */
	private getAuthorizationHeader( scheme: 'bearer' ): string {
		if ( scheme === 'bearer' ) {
			return `Bearer ${ this.bearerToken }`;
		}

		throw new Error( 'Authorization scheme not yet implemented.' );
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
		const path = `/rest/${ version }/${ endpoint }`.replace( /([^:]\/)\/+/g, '$1' );
		return new URL( path, BASE_URL );
	}

	/**
	 * Sends the request to the endpoint, then returns the decoded JSON.
	 *
	 * @param {URL} url URL of the endpoint.
	 * @param {RequestParams} params Parameters for the request.
	 * @returns {Promise<any>} Decoded JSON response.
	 */
	private async sendRequest( url: URL, params: RequestParams ): Promise< any > {
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
				Authorization: this.getAuthorizationHeader( 'bearer' ),
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
