import fs from 'fs';
import FormData from 'form-data';
import { SecretsManager } from './secrets';
import {
	BearerTokenErrorResponse,
	TestFile,
	SettingsParams,
	PluginParams,
	AllDomainsResponse,
	DomainData,
	PublicizeConnectionDeletedResponse,
	PublicizeConnection,
	SubscriberDeletedResponse,
	PostCountsResponse,
} from './types';
import type { Roles } from './lib';
import type {
	AccountDetails,
	BearerTokenResponse,
	MyAccountInformationResponse,
	AccountClosureResponse,
	SiteDeletionResponse,
	CalypsoPreferencesResponse,
	ErrorResponse,
	AccountCredentials,
	NewSiteResponse,
	NewSiteParams,
	NewInviteResponse,
	NewCommentResponse,
	AllInvitesResponse,
	DeleteInvitesResponse,
	NewPostParams,
	NewMediaResponse,
	PostResponse,
	ReaderResponse,
	Invite,
	AllPluginsResponse,
	PluginResponse,
	PluginRemovalResponse,
	AllWidgetsResponse,
	CommentLikeResponse,
	JetpackSearchResponse,
	JetpackSearchParams,
	Subscriber,
	SitePostState,
} from './types';

/* Internal types and interfaces */

/**
 * Specifies the version of WordPress.com REST API.
 */
type EndpointVersions = '1' | '1.1' | '1.2' | '1.3' | '2';
type EndpointNamespace = 'rest' | 'wpcom' | 'wp';

/**
 * Interface defining the request structure to be sent to the API.
 */

type RequestParams = Pick< RequestInit, 'method' | 'headers' | 'body' >;

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
	 *
	 * @param {AccountCredentials} credentials User credentials.
	 * @param {string} [bearerToken] BearerToken for the user.
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
		const response = await fetch( url.toString(), params as RequestInit );
		return response.json();
	}

	/* Sites */

	/**
	 * Gets the list of domains belonging to the user.
	 *
	 * This method returns an array of DomainData objects, where
	 * each object exposes a few key pieces of data from
	 * the response JSON:
	 * - domain
	 * - blog id
	 *
	 * @returns {Promise<AllDomainsResponse>} JSON array of sites.
	 * @throws {Error} If API responded with an error.
	 */
	async getAllDomains(): Promise< AllDomainsResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest( this.getRequestURL( '1.1', '/all-domains/' ), params );

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

		// Covert the `blogid` attribute to number, which is how
		// it is used elsewhre in the REST API.
		response[ 'blog_details' ][ 'blogid' ] = parseInt( response[ 'blog_details' ][ 'blogid' ] );
		return response;
	}

	/**
	 * Deletes a site belonging to the user.
	 *
	 * This method will perform a quick check to ensure the target site
	 * belongs to the user.
	 *
	 * Additionally, if the target site has an upgrade purchased within the
	 * sandboxed environment, it can be deleted without first
	 * cancelling the subscription.
	 *
	 * Otherwise the active subscription must be first cancelled
	 * or else the REST API will throw a HTTP 403 status.
	 *
	 * @param { {id: number, domain: string}} targetSite Details for the target site to be deleted.
	 * @returns {SiteDeletionResponse | null} Null if deletion was unsuccessful or not performed. SiteDeletionResponse otherwise.
	 */
	async deleteSite( targetSite: {
		id: number;
		domain: string;
	} ): Promise< SiteDeletionResponse | null > {
		// Every new testing site since 2021 has the prefix `e2e` of some sort.
		if ( ! targetSite.domain.includes( 'e2e' ) ) {
			return null;
		}

		console.log( `Deleting site ${ targetSite.domain }.` );

		const scheme = 'http://';
		const targetDomain = targetSite.domain.startsWith( scheme )
			? targetSite.domain.replace( scheme, '' )
			: targetSite.domain;

		const mySites: AllDomainsResponse = await this.getAllDomains();

		const match = mySites.domains.filter( ( site: DomainData ) => {
			site.blog_id === targetSite.id && site.domain === targetDomain;
		} );

		if ( ! match ) {
			return null;
		}

		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ targetSite.id }/delete` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			console.warn( `Failed to delete site ID ${ targetSite.domain }` );
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		console.log( `Successfully deleted site ID ${ targetSite.domain }` );
		return response;
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

		// This handles API errors such as `unauthorized`.
		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		// This handles "errors" relating to the invite itself and can be an array.
		// For instance, if a user tries to invite itself, or invite an already added user.
		if ( response.errors.length ) {
			for ( const err of response.errors ) {
				console.error( `${ err.code }: ${ err.message }` );
			}
			throw new Error( `Failed to create invite due to ${ response.errors.length } errors.` );
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
	 * Updates the user's settings.
	 *
	 * @param {SettingsParams} details Key/value attributes to be set for the user.
	 * @returns { { [key: string]: string | number } } Generic object.
	 * @throws {Error} If an unknown attribute or invalid value for a known attribute was provided.
	 */
	async setMySettings( details: SettingsParams ): Promise< { [ key: string ]: string | number } > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
			body: JSON.stringify( details ),
		};

		const response = await this.sendRequest( this.getRequestURL( '1.1', '/me/settings' ), params );

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

	/* Reader */

	/**
	 * Gets the latest posts from blogs a user follows.
	 *
	 * @returns {Promise<ReaderResponse>} An Array of posts.
	 * @throws {Error} If API responded with an error.
	 */
	async getReaderFeed(): Promise< ReaderResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', '/read/following' ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/* Posts */

	/**
	 * Given a siteID, checks whether any posts exists of a given state.
	 *
	 * @param {number} siteID Site ID.
	 * @param param1 Keyed object parameter.
	 * @param {SitePostState} param1.state State of the published post.
	 */
	async siteHasPost(
		siteID: number,
		{ state = 'publish' }: { state: SitePostState }
	): Promise< boolean > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response: PostCountsResponse = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/post-counts/post` ),
			params
		);

		return response.counts.all[ state ] !== undefined && response.counts.all[ state ] > 0;
	}

	/**
	 * Creates a post on the site.
	 *
	 * @param {number} siteID Target site ID.
	 * @param {NewPostParams} details Details of the new post.
	 */
	async createPost( siteID: number, details: NewPostParams ): Promise< PostResponse > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
			body: JSON.stringify( details ),
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/posts/new` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/**
	 * Deletes a post denoted by postID from the site.
	 *
	 * @param {number} siteID Target site ID.
	 * @param {number} postID Target post ID.
	 */
	async deletePost( siteID: number, postID: number ): Promise< PostResponse > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/posts/${ postID }/delete` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/* Comments */

	/**
	 * Creates a comment on the given post.
	 *
	 * @param {number} siteID Target site ID.
	 * @param {number} postID Target post ID.
	 * @param {string} comment Details of the new comment.
	 * @returns {Promise<NewCommentResponse>} Confirmation details of the new comment.
	 * @throws {Error} If API responded with an error.
	 */
	async createComment(
		siteID: number,
		postID: number,
		comment: string
	): Promise< NewCommentResponse > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
			body: JSON.stringify( { content: comment } ),
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/posts/${ postID }/replies/new` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/**
	 * Deletes a given comment from a site.
	 *
	 * @param {number} siteID Target site ID.
	 * @param {number} commentID Target comment ID.
	 * @returns {Promise< any >} Decoded JSON response.
	 * @throws {Error} If API responded with an error.
	 */
	async deleteComment( siteID: number, commentID: number ): Promise< any > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/comments/${ commentID }/delete` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/**
	 * Method to perform two similar operations - like and unlike a comment.
	 *
	 * @param {'like'|'unlike'} action Action to perform on the comment.
	 * @param {number} siteID Target site ID.
	 * @param {number} commentID Target comment ID.
	 */
	async commentAction(
		action: 'like' | 'unlike',
		siteID: number,
		commentID: number
	): Promise< CommentLikeResponse > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		let endpoint: URL;
		if ( action === 'like' ) {
			endpoint = this.getRequestURL(
				'1.1',
				`/sites/${ siteID }/comments/${ commentID }/likes/new`
			);
		} else {
			endpoint = this.getRequestURL(
				'1.1',
				`/sites/${ siteID }/comments/${ commentID }/likes/mine/delete`
			);
		}

		const response = await this.sendRequest( endpoint, params );

		// Tried to like the comment, but failed to do so
		// and the user still has not liked the comment.
		if ( action === 'like' && response.like_count !== 1 ) {
			throw new Error( `Failed to like ${ commentID } on site ${ siteID }` );
		}
		// Tried to unlike the comment, but failed to do so
		// and the user still likes the comment.
		if ( action === 'unlike' && response.like_count !== 0 ) {
			throw new Error( `Failed to unlike ${ commentID } on site ${ siteID }` );
		}

		// Otherwise, consider it a success.
		return response;
	}

	/* Media */

	/**
	 * Uploads a media file.
	 *
	 * @param {number} siteID Target site ID.
	 * @param param1 Optional object parameter.
	 * @param {TestFile} param1.media Local media file to be uploaded.
	 * @param {string} param1.mediaURL URL to the media file to be uploaded.
	 * @throws {Error} If neither media nor mediaURL are defined.
	 */
	async uploadMedia(
		siteID: number,
		{ media, mediaURL }: { media?: TestFile; mediaURL?: string }
	): Promise< NewMediaResponse > {
		let params: RequestParams | undefined;

		if ( ! media && ! mediaURL ) {
			throw new Error( 'Either `media` or `mediaURL` parameter must be defined.' );
		}

		if ( media ) {
			const data = new FormData();
			data.append( 'media[]', fs.createReadStream( media.fullpath ) );

			params = {
				method: 'post',
				headers: {
					// Important: include the boundary
					Authorization: await this.getAuthorizationHeader( 'bearer' ),
					...data.getHeaders(),
				},
				body: data.getBuffer(),
			};
		}
		if ( mediaURL ) {
			params = {
				method: 'post',
				headers: {
					Authorization: await this.getAuthorizationHeader( 'bearer' ),
					'Content-Type': this.getContentTypeHeader( 'json' ),
				},
				body: JSON.stringify( { media_urls: mediaURL } ),
			};
		}

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/media/new` ),
			params as RequestParams
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/* Shopping Cart */

	/**
	 * Clears the shopping cart.
	 *
	 * @param {number} siteID Site that has the shopping cart.
	 * @throws {Error} If the user doesn't have access to the siteID.
	 * @returns {{success:true}} If the request was successful.
	 */
	async clearShoppingCart( siteID: number ): Promise< { success: true } > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/shopping-cart/clear` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/* Plugins */

	/**
	 * Gets a list of plugins installed in a site.
	 *
	 * @param {number} siteID Target site ID.
	 * @returns {Promise<AllPluginsResponse>} An Array of plugins.
	 * @throws {Error} If API responded with an error.
	 */
	async getAllPlugins( siteID: number ): Promise< AllPluginsResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/plugins` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/**
	 * Modifies a plugin installed in a site.
	 *
	 * @param {number} siteID Target site ID.
	 * @param {string} pluginID Plugin ID.
	 * @param {PluginResponse} details Key/value attributes to be set for the user.
	 * @returns {Promise<PluginResponse>} Details for the plugin.
	 * @throws {Error} If API responded with an error.
	 */
	async modifyPlugin(
		siteID: number,
		pluginID: string,
		details: PluginParams
	): Promise< PluginResponse > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
			body: JSON.stringify( details ),
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/plugins/${ pluginID }` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/**
	 * Finds a plugin by name, deactivates it, and removes it from the site.
	 *
	 * @returns {Promise<PluginRemovalResponse | null>} Null if plugin removal was unsuccessful or not performed. PluginRemovalResponse otherwise.
	 * @throws {Error} If API responded with an error.
	 */
	async removePluginIfInstalled(
		siteID: number,
		pluginName: string
	): Promise< PluginRemovalResponse | null > {
		const myPlugins = await this.getAllPlugins( siteID );
		for ( const plugin of myPlugins.plugins ) {
			if ( plugin.name === pluginName ) {
				const pluginID = encodeURIComponent( plugin.id );
				/// Plugin should be deactivated before removal.
				if ( plugin.active ) {
					await this.modifyPlugin( siteID, pluginID, { active: false } );
				}
				const params: RequestParams = {
					method: 'post',
					headers: {
						Authorization: await this.getAuthorizationHeader( 'bearer' ),
						'Content-Type': this.getContentTypeHeader( 'json' ),
					},
				};

				return await this.sendRequest(
					this.getRequestURL( '1.1', `/sites/${ siteID }/plugins/${ pluginID }/delete` ),
					params
				);
			}
		}

		// If nothing matches, return that no action was performed.
		return null;
	}

	/* Widgets */

	/**
	 * This method either deactivates or deletes the widget from the site.
	 *
	 * As noted in the comments, this method is quite overloaded as its outcome
	 * differs depending on the current state of the widget (activate/deactivated).
	 *
	 * @param {number} siteID ID of the target site.
	 * @param {string} widgetID ID of the target widget.
	 */
	async deleteWidget( siteID: number, widgetID: string ): Promise< void > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/widgets/widget:${ widgetID }/delete` ),
			params
		);

		// This API call is quite overloaded in what it can do.
		// If the `widgetId` does not exist for any reason, then an 'error' is returned.
		// We can safely ignore this 'error'.
		// If the widget is active, the call will first deactivate the widget.
		// If the widget is deactivated, the call will remoe the widget.
		// For all other unexpected errors, throw an error.
		if ( response.hasOwnProperty( 'error' ) && response.error === 'not_found' ) {
			console.info( `Widget ${ widgetID } not found.` );
			return;
		} else if ( response.length === 0 ) {
			console.info( `Deleted widget ${ widgetID }.` );
		} else if ( response.id === widgetID ) {
			console.info( `Deactivated widget ${ widgetID }` );
		} else {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}
	}

	/**
	 * Returns the list of widgets for a siteID.
	 *
	 * @param {number} siteID ID of the target site.
	 * @returns {AllWidgetsResponse} Array of Widgets object describing the list of widgets on the site.
	 */
	async getAllWidgets( siteID: number ): Promise< AllWidgetsResponse > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/widgets` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response.widgets;
	}

	/**
	 * Deletes or deactivates all widgets for a given site.
	 *
	 * @param {number} siteID ID of the target site.
	 */
	async deleteAllWidgets( siteID: number ): Promise< void > {
		const widgets = await this.getAllWidgets( siteID );

		widgets.map( async ( widget ) => await this.deleteWidget( siteID, widget.id ) );
	}

	/* Search */

	/**
	 * Execute a primitive Jetpack site search request.
	 * Useful for checking if something has been indexed yet.
	 *
	 * @param {number} siteId ID of the target site.
	 * @param {JetpackSearchParams} searchParams The search parameters.
	 */
	async jetpackSearch(
		siteId: number,
		searchParams: JetpackSearchParams
	): Promise< JetpackSearchResponse > {
		// Private sites require auth, so always auth!
		const requestParams: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
			},
		};

		const requestUrl = this.getRequestURL( '1.3', `/sites/${ siteId }/search` );

		const { query, size } = searchParams;
		requestUrl.searchParams.append( 'query', query );
		if ( size ) {
			requestUrl.searchParams.append( 'size', size.toString() );
		}

		const response = await this.sendRequest( requestUrl, requestParams );

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response;
	}

	/* Publicize */

	/**
	 * Returns an array of existing publicize (social) connections.
	 *
	 * @param {number} siteID Site ID.
	 * @returns {Promise<Array<PublicizeConnection>>} Array of Publicize connections.
	 */
	async getAllPublicizeConnections( siteID: number ): Promise< Array< PublicizeConnection > > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const response = await this.sendRequest(
			this.getRequestURL( '1.1', `/sites/${ siteID }/publicize-connections` ),
			params
		);

		if ( response.hasOwnProperty( 'error' ) ) {
			throw new Error(
				`${ ( response as ErrorResponse ).error }: ${ ( response as ErrorResponse ).message }`
			);
		}

		return response[ 'connections' ];
	}

	/**
	 * Given siteID and connectionID, deletes the connection.
	 *
	 * @param {number} siteID Site ID.
	 * @param {number} connectionID Publicize connection ID.
	 * @returns {Promise<PublicizeConnectionDeletedResponse>} Confirmation of connection being deleted.
	 */
	async deletePublicizeConnection(
		siteID: number,
		connectionID: number
	): Promise< PublicizeConnectionDeletedResponse > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		return await this.sendRequest(
			this.getRequestURL(
				'1.1',
				`/sites/${ siteID }/publicize-connections/${ connectionID }/delete`
			),
			params
		);
	}

	/* Subscribers/Email Followers/Newsletters */

	/**
	 * Given a site ID, returns the list of newsletter subscribers.
	 *
	 * @param {number} siteID Site ID to return list of users for.
	 */
	async getAllSubscribers( siteID: number ): Promise< Subscriber[] > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		// This is a V2 API call.
		const response = await this.sendRequest(
			this.getRequestURL( '2', `/sites/${ siteID }/subscribers`, 'wpcom' ),
			params
		);

		return response[ 'subscribers' ];
	}

	/**
	 * Given a siteID and email address of the subscribed user to delete,
	 * removes the subscribed user.
	 *
	 * @param {number} siteID Site ID where the user is subscribed.
	 * @param {string} email Email address of the subscriber to delete.
	 */
	async deleteSubscriber(
		siteID: number,
		email: string
	): Promise< SubscriberDeletedResponse | null > {
		const params: RequestParams = {
			method: 'post',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		const subscribers = await this.getAllSubscribers( siteID );

		for ( const subscriber of subscribers ) {
			if ( subscriber.email_address.trim() === email.trim() ) {
				return await this.sendRequest(
					this.getRequestURL(
						'1.1',
						`/sites/${ siteID }/email-followers/${ subscriber.subscription_id }/delete`
					),
					params
				);
			}
		}
		return null;
	}

	/**
	 * Get the active theme for a given site.
	 *
	 * @param siteID
	 */
	async getActiveTheme( siteID: number ): Promise< string > {
		const params: RequestParams = {
			method: 'get',
			headers: {
				Authorization: await this.getAuthorizationHeader( 'bearer' ),
				'Content-Type': this.getContentTypeHeader( 'json' ),
			},
		};

		// This is a V2 API call.
		const response = await this.sendRequest(
			this.getRequestURL( '2', `/sites/${ siteID }/themes?status=active`, 'wp' ),
			params
		);

		return response[ 0 ].stylesheet;
	}
}
