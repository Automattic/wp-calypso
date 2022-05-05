import fetch, { RequestInit } from 'node-fetch';

type GenericDict = { [ key: string ]: string | number };
type RequestMethods = 'post' | 'get';
type RequestParams = {
	method: 'post' | 'get';
	headers: GenericDict;
	body?: GenericDict;
};

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
	 * @param {string} url URL endpoint to send the request.
	 * @param {RequestParams} params Parameters for the request.
	 */
	private async sendRequest( url: string, params: RequestParams ): Promise< string > {
		const response = await fetch( new URL( url, BASE_URL ), params as RequestInit );
		return response.json();
	}
}
