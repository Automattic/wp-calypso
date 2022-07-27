import fetch from 'node-fetch';
import { SecretsManager } from './secrets';
import { BearerTokenErrorResponse, Invite } from './types';
import type { Roles } from './lib';
import type {
	AccountDetails,
	SiteDetails,
	BearerTokenResponse,
	AllSitesResponse,
	MyAccountInformationResponse,
	AccountClosureResponse,
	SiteDeletionResponse,
	CalypsoPreferencesResponse,
	ErrorResponse,
	AccountCredentials,
	NewSiteResponse,
	NewSiteParams,
	NewInviteResponse,
	AllInvitesResponse,
	DeleteInvitesResponse,
} from './types';
import type { BodyInit, HeadersInit, RequestInit } from 'node-fetch';

/* Internal types and interfaces */

/**
 * Specifies the version of WordPress.com REST API.
 */
type EndpointVersions = '1' | '1.1' | '1.2' | '1.3' | '2';
type EndpointNamespace = 'rest' | 'wpcom';

/**
 * Interface defining the request structure to be sent to the API.
 */
interface RequestParams {
	method: 'post' | 'get';
	headers?: HeadersInit;
	body?: BodyInit;
}

/* Constants */

export const BEARER_TOKEN_URL = 'https://wordpress.com/wp-login.php?action=login-endpoint';
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
	 * @throws {Error} If the API responded with a success status of false.
	 */
	async getBearerToken(): Promise< string > {
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
		const response: BearerTokenResponse | BearerTokenErrorResponse = await this.sendRequest(
			new URL( BEARER_TOKEN_URL ),
			{
				method: 'post',
				body: params,
			}
		);

		if ( response.success === false ) {
			const firstError = response.data.errors.at( 0 );
			throw new Error( `${ firstError?.code }: ${ firstError?.message }` );
		}

		this.bearerToken = response.data.bearer_token;
		return response.data.bearer_token;
	}

	/* Request builder methods */

	/**
	 * Returns the appropriate authorization header.
	 *
	 * @returns {Promise<string>} Authorization header in the requested scheme.
	 * @throws {Error} If a scheme not yet implemented is requested.
	 */
	async getAuthorizationHeader( scheme: 'bearer' ): Promise< string > {
		if ( scheme === 'bearer' ) {
			const bearerToken = await this.getBearerToken();
			return `Bearer ${ bearerToken }`;
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
	 * @param {EndpointNamespace} [namespace] REST API namespace.
	 * @returns {URL} Full URL to the endpoint.
	 */
	getRequestURL(
		version: EndpointVersions,
		endpoint: string,
		namespace: EndpointNamespace = 'rest'
	): URL {
		const path = `/${ namespace }/v${ version }/${ endpoint }`.replace( /([^:]\/)\/+/g, '$1' );
		const sanitizedPath = path.trimEnd().replace( /\/$/, '' );
		return new URL( sanitizedPath, REST_API_BASE_URL );
	}

	/**
	 * Sends the request to the endpoint, then returns the decoded JSON.
	 *
	 * @param {URL} url URL of the endpoint.
	 * @param {RequestParams} params Parameters for the request.
	 * @returns {Promise<any>} Decoded JSON response.
	 */
	async sendRequest( url: URL, params: RequestParams | URLSearchParams ): Promise< any > {
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
	 * @throws {Error} If API responded with an error.
	 */
	async getAllSites(): Promise< AllSitesResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest( this.getRequestURL( '1.1', '/me/sites' ), params );

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/**
	 * Given parameters, create a new site.
	 *
	 * @param {NewSiteParams} newSiteParams Details for the new site.
	 * @returns {Promise<NewSiteResponse>} Confirmation details for the new site.
	 * @throws {ErrorResponse} If API responded with an error.
	 */
	async createSite( newSiteParams: NewSiteParams ): Promise< NewSiteResponse > {
		const body = {
			client_id: SecretsManager.secrets.calypsoOauthApplication.client_id,
			client_secret: SecretsManager.secrets.calypsoOauthApplication.client_secret,
			blog_name: newSiteParams.name,
			blog_title: newSiteParams.title,
		};

		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
			body: JSON.stringify( body ),
		};

		const response = await this.sendRequest( this.getRequestURL( '1.1', '/sites/new' ), params );

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/**
	 * Deletes a site.
	 *
	 * If the target site has an upgrade purchased within the
	 * sandboxed environment, it can be deleted without first
	 * cancelling the subscription.
	 *
	 * Otherwise the active subscription must be first cancelled
	 * otherwise the REST API will throw a HTTP 403 status.
	 *
	 * @param {SiteDetails} expectedSiteDetails Expected details for the site to be deleted.
	 * @returns {SiteDeletionResponse | null} Null if deletion was unsuccessful or not performed. SiteDeletionResponse otherwise.
	 */
	async deleteSite( expectedSiteDetails: SiteDetails ): Promise< SiteDeletionResponse | null > {
		if ( ! expectedSiteDetails.url.includes( 'e2e' ) ) {
			console.warn( `Aborting site deletion: target is not a test site.` );
			return null;
		}

		const mySites = await this.getAllSites();

		// Start from tail end of the array since
		// the target of site deletion is likely the
		// most recently created site.
		for ( const site of mySites.sites.reverse() ) {
			const myAccountInformation = await this.getMyAccountInformation();

			if ( site.site_owner !== myAccountInformation.ID ) {
				console.info(
					`Aborting site deletion: site owner ID did not match.\nExpected: ${ site.site_owner }, Got: ${ myAccountInformation.ID } `
				);
				break;
			}

			// Normalize URL to ensure equal comparison.
			if ( new URL( site.URL ).href !== new URL( expectedSiteDetails.url ).href ) {
				console.info(
					`Aborting site deletion: site URL did not match.\nExpected: ${ site.URL }, Got: ${ expectedSiteDetails.url } `
				);
				break;
			}

			if ( site.ID !== parseInt( expectedSiteDetails.id ) ) {
				console.info(
					`Aborting site deletion: site ID did not match.\nExpected: ${ site.ID }, Got: ${ expectedSiteDetails.id } `
				);
				break;
			}

			if ( site.name !== expectedSiteDetails.name ) {
				console.info(
					`Aborting site deletion: site name did not match.\nExpected: ${ site.name }, Got: ${ expectedSiteDetails.name } `
				);
				break;
			}

			const params: RequestParams = {
				method: 'post',
				headers: {
					Authorization: await this.getAuthorizationHeader( 'bearer' ),
					'Content-Type': this.getContentTypeHeader( 'json' ),
				},
			};

			return await this.sendRequest(
				this.getRequestURL( '1.1', `/sites/${ expectedSiteDetails.id }/delete` ),
				params
			);
		}
		// If nothing matches, return that no action was performed.
		return null;
	}

	/* Invites */

	/**
	 * Creates a user invite.
	 *
	 * @param {number} siteID ID of the site where a new invite will be created.
	 * @param param0 Keyed object parameter.
	 * @param {string[]} param0.email List of emails to send invites to.
	 * @param {Roles} param0.role Role of the user.
	 * @param {string} param0.message Message to be sent to the invitee.
	 * @throws {Error} If API responds with an error, or a list of errors are returned.
	 */
	async createInvite(
		siteID: number,
		{
			email,
			role,
			message,
		}: {
			email: string[];
			role: Roles;
			message?: string;
		}
	): Promise< NewInviteResponse > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
			body: JSON.stringify( {
				invitees: email,
				role: role,
				message: message !== undefined ? message : '',
			} ),
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/invites/new` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		if ( response.errors === [] ) {
			console.log( response );
			throw new Error( `Failed to create invite: ${ response.errors }` );
		}

		return response;
	}

	/**
	 *
	 * @param siteID
	 */
	async getInvites( siteID: number ): Promise< AllInvitesResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/invites` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response[ 'invites' ];
	}

	/**
	 *
	 * @param siteID
	 * @param email
	 */
	async deleteInvite( siteID: number, email: string ): Promise< boolean > {
		const invites = await this.getInvites( siteID );

		let inviteID = undefined;

		Object.values( invites ).forEach( ( invite: Invite ) => {
			if (
				invite.invited_by.site_ID === siteID &&
				invite.is_pending &&
				invite.user.email === email
			) {
				inviteID = invite.invite_key;
			}
		} );

		if ( inviteID === undefined ) {
			throw new Error(
				`Aborting invite deletion: inviteID not found for email: ${ email } and siteID: ${ siteID }}`
			);
		}

		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
			body: JSON.stringify( {
				invite_ids: [ inviteID ],
			} ),
		};

		const response: DeleteInvitesResponse = await this.sendRequest(
			this.getRequestURL( '2', `/sites/${ siteID }/invites/delete`, 'wpcom' ),
			params
		);

		// This call does not return a traditional error that's in the
		// format of ErrorResponse, instead returning a
		// DeleteInvitesResponse which always has the `deleted` and
		// `invalid` fields.
		if ( response.deleted.includes( inviteID ) ) {
			return true;
		}
		return false;
	}

	/* Me */

	/**
	 * Returns the account information for the user authenticated
	 * via the bearer token.
	 *
	 * @returns {Promise<MyAccountInformationResponse>} Response containing user details.
	 * @throws {Error} If API responded with an error.
	 */
	async getMyAccountInformation(): Promise< MyAccountInformationResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest( this.getRequestURL( '1.1', '/me' ), params );

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
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
	 * @param { AccountDetails} expectedAccountDetails Details of the accounts to be closed.
	 * @returns {Promise<boolean>} True if account closure was successful. False otherwise.
	 */
	async closeAccount( expectedAccountDetails: AccountDetails ): Promise< AccountClosureResponse > {
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
