import fetch, { RequestInit } from 'node-fetch';

type RequestMethods = 'post' | 'get';
type RequestParams = {
	method: 'post' | 'get';
	headers: GenericDict;
	body?: GenericDict;
};
type GenericDict = { [ key: string ]: string | number };

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

const BASE_URL = 'https://public-api.wordpress.com/rest/v1.1/';

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

	/**
	 * Builds and returns the request parameters.
	 *
	 * @param {RequestMethods} method Supported request methods.
	 * @param {GenericDict} [body] Request body.
	 * @returns {RequestParams} Completed request parameter.
	 */
	private buildRequestParams( method: RequestMethods, body?: GenericDict ): RequestParams {
		const params: RequestParams = {
			method: method,
			headers: {
				Authorization: `Bearer ${ this.bearerToken }`,
				'Content-Type': 'application/json',
			},
		};

		// POST requests require a body.
		if ( method === 'post' ) {
			if ( ! body ) {
				throw new Error( 'Cannot build a POST request with undefined body.' );
			}
			params[ 'body' ] = body;
		}

		return params;
	}

	/**
	 * Sends the request to the endpoint.
	 *
	 * @param {string} endpoint Endpoint to send the request.
	 * @param {RequestParams} params Parameters for the request.
	 */
	private async sendRequest( endpoint: string, params: RequestParams ): Promise< any > {
		// Trim the initial forward slash.
		if ( endpoint.startsWith( '/' ) ) {
			endpoint = endpoint.slice( 1 );
		}

		const response = await fetch( new URL( endpoint, BASE_URL ), params as RequestInit );
		return response.json();
	}

	/**
	 *
	 */
	async getMySites(): Promise< Site[] > {
		const response: MySitesResponse = await this.sendRequest(
			'/me/sites',
			this.buildRequestParams( 'get' )
		);

		return response[ 'sites' ];
	}
}
