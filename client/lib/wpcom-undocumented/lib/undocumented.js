import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import { camelCase, isPlainObject, omit, snakeCase, set } from 'lodash';
import { stringify } from 'qs';
import { getLanguage, getLocaleSlug } from 'calypso/lib/i18n-utils';
import readerContentWidth from 'calypso/reader/lib/content-width';
import Me from './me';
import Site from './site';

const debug = debugFactory( 'calypso:wpcom-undocumented:undocumented' );
const { Blob } = globalThis; // The linter complains if I don't do this...?

/**
 * Some endpoints are restricted by OAuth client IDs and secrets
 * to prevent them being spammed. This adds these keys to the request
 * so that they will be successful. This is not a sufficent measure
 * against spam as these keys are exposed publicly
 *
 * @param { object } query - Add client_id and client_secret to the query.
 */
function restrictByOauthKeys( query ) {
	query.client_id = config( 'wpcom_signup_id' );
	query.client_secret = config( 'wpcom_signup_key' );
}

/**
 * Create an `Undocumented` instance
 *
 * @param {object} wpcom - The request handler
 * @returns {Undocumented} - An instance of Undocumented
 */
function Undocumented( wpcom ) {
	if ( ! ( this instanceof Undocumented ) ) {
		return new Undocumented( wpcom );
	}
	this.wpcom = wpcom;
}

Undocumented.prototype.site = function ( id ) {
	return new Site( id, this.wpcom );
};

Undocumented.prototype.me = function () {
	return new Me( this.wpcom );
};

/*
 * Retrieve Jetpack modules data for a site with id siteid.
 * Uses the REST API of the Jetpack site.
 *
 * @param {number}      [siteId]
 * @param {Function} fn
 */
Undocumented.prototype.getJetpackModules = function ( siteId, fn ) {
	return this.wpcom.req.get(
		{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
		{ path: '/jetpack/v4/module/all/' },
		fn
	);
};

/*
 * Activate a Jetpack module with slug moduleSlug for a site with id siteid.
 * Uses the REST API of the Jetpack site.
 *
 * @param {number} [siteId]
 * @param {string} [moduleSlug]
 * @param {Function} fn
 */
Undocumented.prototype.jetpackModuleActivate = function ( siteId, moduleSlug, fn ) {
	return this.wpcom.req.post(
		{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
		{
			path: '/jetpack/v4/module/' + moduleSlug + '/active/',
			body: JSON.stringify( { active: true } ),
		},
		fn
	);
};

/*
 * Deactivate a Jetpack module with slug moduleSlug for a site with id siteid.
 * Uses the REST API of the Jetpack site.
 *
 * @param {number} [siteId]
 * @param {string} [moduleSlug]
 * @param {Function} fn
 */
Undocumented.prototype.jetpackModuleDeactivate = function ( siteId, moduleSlug, fn ) {
	return this.wpcom.req.post(
		{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
		{
			path: '/jetpack/v4/module/' + moduleSlug + '/active/',
			body: JSON.stringify( { active: false } ),
		},
		fn
	);
};

/**
 * Fetches settings for the Monitor module.
 *
 * @param {number} [siteId] The site ID
 * @param {Function} fn The callback function
 */
Undocumented.prototype.fetchMonitorSettings = function ( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id: query' );
	return this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId }, fn );
};

Undocumented.prototype.updateMonitorSettings = function (
	siteId,
	emailNotifications,
	wpNoteNotifications,
	fn
) {
	debug( '/jetpack-blogs/:site_id: query' );
	return this.wpcom.req.post(
		{ path: '/jetpack-blogs/' + siteId },
		{},
		{ email_notifications: emailNotifications, wp_note_notifications: wpNoteNotifications },
		fn
	);
};

/**
 * Disconnects a Jetpack site with id siteId from WP.com
 *
 * @param {number} [siteId] The site ID
 * @param {Function} fn The callback function
 */
Undocumented.prototype.disconnectJetpack = function ( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id:/mine/delete query' );
	return this.wpcom.req.post( { path: '/jetpack-blogs/' + siteId + '/mine/delete' }, fn );
};

/**
 * Fetches plugin registration keys for WordPress.org sites with paid services
 *
 * @param {number} [siteId] The site ID
 * @param {Function} fn The callback function
 */
Undocumented.prototype.fetchJetpackKeys = function ( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id:/keys query' );
	return this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId + '/keys' }, fn );
};

/**
 * Test if a Jetpack Site is connected to .com
 *
 * @param {number} [siteId] The site ID
 * @param {Function} fn The callback function
 */
Undocumented.prototype.testConnectionJetpack = function ( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id:/test-connection query' );
	return this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId + '/test-connection' }, fn );
};

/*
 * Retrieve current connection status of a Jetpack site.
 *
 * @param {number}      [siteId]
 * @param {Function} fn
 */
Undocumented.prototype.getJetpackConnectionStatus = function ( siteId, fn ) {
	return this.wpcom.req.get(
		{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
		{ path: '/jetpack/v4/connection/' },
		fn
	);
};

/*
 * Retrieve current user's connection data for a Jetpack site.
 *
 * @param {number}      [siteId]
 * @param {Function} fn
 */
Undocumented.prototype.getJetpackUserConnectionData = function ( siteId, fn ) {
	return this.wpcom.req.get(
		{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
		{ path: '/jetpack/v4/connection/data/' },
		fn
	);
};

Undocumented.prototype.jetpackLogin = function ( siteId, _wp_nonce, redirect_uri, scope, state ) {
	debug( '/jetpack-blogs/:site_id:/jetpack-login query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/jetpack-login';
	const params = { _wp_nonce, redirect_uri, scope, state };
	return this.wpcom.req.get( { path: endpointUrl }, params );
};

Undocumented.prototype.jetpackAuthorize = function (
	siteId,
	code,
	state,
	redirect_uri,
	secret,
	jp_version,
	from
) {
	debug( '/jetpack-blogs/:site_id:/authorize query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/authorize';
	const params = { code, state, redirect_uri, secret, jp_version, from };
	return this.wpcom.req.post( { path: endpointUrl }, params );
};

Undocumented.prototype.jetpackValidateSSONonce = function ( siteId, ssoNonce, fn ) {
	debug( '/jetpack-blogs/:site_id:/sso-validate query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/sso-validate';
	const params = { sso_nonce: ssoNonce };
	return this.wpcom.req.post( { path: endpointUrl }, params, fn );
};

Undocumented.prototype.jetpackAuthorizeSSONonce = function ( siteId, ssoNonce, fn ) {
	debug( '/jetpack-blogs/:site_id:/sso-authorize query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/sso-authorize';
	const params = { sso_nonce: ssoNonce };
	return this.wpcom.req.post( { path: endpointUrl }, params, fn );
};

Undocumented.prototype.jetpackIsUserConnected = function ( siteId ) {
	debug( '/sites/:site_id:/jetpack-connect/is-user-connected query' );
	const endpointUrl = '/sites/' + siteId + '/jetpack-connect/is-user-connected';
	return this.wpcom.req.get( { path: endpointUrl, apiNamespace: 'wpcom/v2' } );
};

/**
 * Gets the current status of a full sync for a Jetpack site.
 *
 * @param {number|string} siteId The site ID
 * @param {Function} fn The callback function
 */
Undocumented.prototype.getJetpackSyncStatus = function ( siteId, fn ) {
	debug( '/sites/:site_id:/sync/status query' );
	const endpointPath = '/sites/' + siteId + '/sync/status';
	return this.wpcom.req.get( { path: endpointPath }, fn );
};

/**
 * Schedules a full sync for a Jetpack site.
 *
 * @param {number|string} siteId The site ID
 * @param {Function} fn The callback function
 */
Undocumented.prototype.scheduleJetpackFullysync = function ( siteId, fn ) {
	debug( '/sites/:site_id:/sync query' );
	const endpointPath = '/sites/' + siteId + '/sync';
	return this.wpcom.req.post( { path: endpointPath }, {}, fn );
};

/**
 * GET/POST site settings
 *
 * @param {number|string} [siteId] The site ID
 * @param {string} [method] The request method
 * @param {object} [data] The POST data
 * @param {Function} fn The callback function
 */
Undocumented.prototype.settings = function ( siteId, method = 'get', data = {}, fn ) {
	debug( '/sites/:site_id:/settings query' );
	if ( 'function' === typeof method ) {
		fn = method;
		method = 'get';
		data = {};
	}

	// If no apiVersion was specified, use the settings api version with the widest support (1.1)
	const apiVersion = data.apiVersion || '1.1';
	const body = omit( data, [ 'apiVersion' ] );
	const path = '/sites/' + siteId + '/settings';

	if ( 'get' === method ) {
		return this.wpcom.req.get( path, { apiVersion }, fn );
	}

	return this.wpcom.req.post( { path }, { apiVersion }, body, fn );
};

/**
 * Get site keyrings
 *
 * @param {number|string} [siteId] The site ID
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.getSiteKeyrings = function getSiteKeyrings( siteId, fn ) {
	return this.wpcom.req.get( '/sites/' + siteId + '/keyrings', { apiVersion: '1.1' }, fn );
};

/**
 * Create a site keyring
 *
 * @param {number|string} [siteId] The site ID
 * @param {object} [data] site keyring object to create with properties:
 * 	- keyring_id {number} the keyring id link the site to
 * 	- external_user_id {string} Optional. The external user id to link the site to
 * 	- service {string} service name for this keyring id
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.createSiteKeyring = function createSiteKeyring( siteId, data, fn ) {
	return this.wpcom.req.post( '/sites/' + siteId + '/keyrings', { apiVersion: '1.1' }, data, fn );
};

/**
 * Update a site keyring
 *
 * @param {number|string} [siteId] The site ID
 * @param {number} [keyringId] The keyring id to update,
 * @param {string} [externalUserId] The external user id to update on the site keyring
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.updateSiteKeyring = function updateSiteKeyring(
	siteId,
	keyringId,
	externalUserId,
	fn
) {
	return this.wpcom.req.post(
		'/sites/' + siteId + '/keyrings/' + keyringId,
		{ apiVersion: '1.1' },
		{
			external_user_id: externalUserId,
		},
		fn
	);
};

/**
 * Delete a site keyring
 *
 * @param {number|string} [siteId] The site ID
 * @param {number} keyringId The keyring id
 * @param {string|null} externalUserId Optional, the external user id
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.deleteSiteKeyring = function deleteSiteKeyring(
	siteId,
	keyringId,
	externalUserId,
	fn
) {
	if ( ! fn && typeof externalUserId === 'function' ) {
		fn = externalUserId;
		externalUserId = null;
	}

	return this.wpcom.req.post(
		'/sites/' + siteId + '/keyrings/' + keyringId + '/delete',
		{ apiVersion: '1.1' },
		{
			external_user_id: externalUserId,
		},
		fn
	);
};

Undocumented.prototype._sendRequest = function ( originalParams, fn ) {
	const { apiVersion, method } = originalParams;
	const updatedParams = omit( originalParams, [ 'apiVersion', 'method' ] );

	if ( apiVersion ) {
		// TODO: temporary solution for apiVersion until https://github.com/Automattic/wpcom.js/issues/152 is resolved
		return this.wpcom.req[ method.toLowerCase() ]( updatedParams, { apiVersion }, fn );
	}

	return this.wpcom.req[ method.toLowerCase() ]( updatedParams, fn );
};

/**
 * Determine whether a domain name is available for registration
 *
 * @param {string} domain - The domain name to check.
 * @param {number} blogId - Optional blogId to determine if domain is used on another site.
 * @param {boolean} isCartPreCheck - specifies whether this availability check is for a domain about to be added to the cart.
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.isDomainAvailable = function ( domain, blogId, isCartPreCheck, fn ) {
	return this.wpcom.req.get(
		`/domains/${ encodeURIComponent( domain ) }/is-available`,
		{
			blog_id: blogId,
			apiVersion: '1.3',
			is_cart_pre_check: isCartPreCheck,
		},
		fn
	);
};

/**
 * Get the inbound transfer status for this domain
 *
 * @param {string} domain - The domain name to check.
 * @param {string} authCode - The auth code for the given domain to check.
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.checkAuthCode = function ( domain, authCode, fn ) {
	return this.wpcom.req.get(
		`/domains/${ encodeURIComponent( domain ) }/inbound-transfer-check-auth-code`,
		{ auth_code: authCode },
		fn
	);
};

/**
 * Get the inbound transfer status for this domain
 *
 * @param {string} domain - The domain name to check.
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.getInboundTransferStatus = function ( domain, fn ) {
	return this.wpcom.req.get(
		{
			path: `/domains/${ encodeURIComponent( domain ) }/inbound-transfer-status`,
		},
		fn
	);
};

/**
 * Starts an inbound domain transfer that is in the pending_start state.
 *
 * @param {number|string} siteId The site ID
 * @param {string} domain The domain name
 * @param {string} authCode The auth code for the transfer
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.startInboundTransfer = function ( siteId, domain, authCode, fn ) {
	let query = {};
	if ( authCode && authCode !== '' ) {
		query = { auth_code: authCode };
	}

	return this.wpcom.req.get(
		`/domains/${ encodeURIComponent( domain ) }/inbound-transfer-start/${ siteId }`,
		query,
		fn
	);
};

/**
 * Fetches a list of available top-level domain names ordered by popularity.
 *
 * @param {object} query Optional query parameters
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.getAvailableTlds = function ( query = {} ) {
	return this.wpcom.req.get( '/domains/suggestions/tlds', query );
};

/**
 * Retrieves the domain contact information of the user.
 *
 * @param {Function} fn The callback function
 */
Undocumented.prototype.getDomainContactInformation = function ( fn ) {
	debug( '/me/domain-contact-information query' );

	return this._sendRequest(
		{
			path: '/me/domain-contact-information',
			method: 'get',
		},
		function ( error, data ) {
			if ( error ) {
				return fn( error );
			}

			const newData = mapKeysRecursively( data, function ( key ) {
				return key === '_headers' ? key : camelCase( key );
			} );

			fn( null, newData );
		}
	);
};
/**
 *
 * @param domain {string}
 * @param fn {function}
 */
Undocumented.prototype.getDomainPrice = function ( domain, fn ) {
	return this.wpcom.req.get(
		`/domains/${ encodeURIComponent( domain ) }/price`,
		{
			apiVersion: '1.1',
		},
		fn
	);
};

Undocumented.prototype.getDomainRegistrationSupportedStates = function ( countryCode, fn ) {
	debug( '/domains/supported-states/ query' );

	return this._sendRequest(
		{
			path: '/domains/supported-states/' + countryCode,
			method: 'get',
		},
		fn
	);
};

function mapKeysRecursively( object, fn ) {
	return Object.keys( object ).reduce( function ( mapped, key ) {
		let value = object[ key ];
		if ( isPlainObject( value ) ) {
			value = mapKeysRecursively( value, fn );
		}

		mapped[ fn( key ) ] = value;
		return mapped;
	}, {} );
}

/**
 * Validates the specified domain contact information against a list of domain names.
 *
 * @param {object} contactInformation - user's contact information
 * @param {string[]} domainNames - list of domain names
 * @param {Function} fn The callback function
 * @param {object} query Query object for the call to wpcom.req.post
 */
Undocumented.prototype.validateDomainContactInformation = function (
	contactInformation,
	domainNames,
	fn,
	query
) {
	let data = {
		contactInformation: contactInformation,
		domainNames: domainNames,
	};

	debug( '/me/domain-contact-information/validate query' );
	data = mapKeysRecursively( data, snakeCase );

	// Due to backend limitations some versions of this endpoint
	// serialize a nested object in the response, encoding e.g.
	//   { foo: { bar: { baz: [ "error" ] } } }
	// as
	//   { foo.bar.baz: [ "error" ] }
	// here we decide whether to rehydrate this.
	const shouldReshapeResponse = query?.apiVersion === '1.2';

	return this.wpcom.req.post(
		{ path: '/me/domain-contact-information/validate' },
		query,
		data,
		function ( error, successData ) {
			if ( error ) {
				return fn( error );
			}

			// Reshape the error messages to a nested object
			if ( successData.messages && shouldReshapeResponse ) {
				successData.messages = Object.keys( successData.messages ).reduce( ( obj, key ) => {
					set( obj, key, successData.messages[ key ] );
					return obj;
				}, {} );
			}

			const newData = mapKeysRecursively( successData, function ( key ) {
				return key === '_headers' ? key : camelCase( key );
			} );

			fn( null, newData );
		}
	);
};

/**
 * Get site specific details for WordPress.com products
 *
 * @param {Function} siteDomain The site slug
 * @param {Function} fn The callback function
 */
Undocumented.prototype.getSiteProducts = function ( siteDomain, fn ) {
	debug( '/sites/:site_domain:/products query' );

	// the site domain could be for a jetpack site installed in
	// a subdirectory.  encode any forward slash present before making
	// the request
	siteDomain = encodeURIComponent( siteDomain );

	return this._sendRequest(
		{
			path: '/sites/' + siteDomain + '/products',
			method: 'get',
		},
		fn
	);
};

/**
 * Get the user's billing history
 *
 * @param {Function} fn The callback function
 */
Undocumented.prototype.billingHistory = function ( fn ) {
	return this._sendRequest(
		{
			path: '/me/billing-history',
			method: 'get',
			apiVersion: '1.3',
		},
		fn
	);
};

/**
 * Get a site specific details for WordPress.com plans
 *
 * @param {Function} siteDomain The site slug
 * @param {Function} fn The callback function
 */
Undocumented.prototype.getSitePlans = function ( siteDomain, fn ) {
	debug( '/sites/:site_domain:/plans query' );

	// the site domain could be for a jetpack site installed in
	// a subdirectory.  encode any forward slash present before making
	// the request
	siteDomain = encodeURIComponent( siteDomain );

	return this._sendRequest(
		{
			path: '/sites/' + siteDomain + '/plans',
			method: 'get',
			apiVersion: '1.3',
		},
		fn
	);
};

/**
 * Get a site specific details for WordPress.com featurs
 *
 * @param {Function} siteDomain The site slug
 * @param {Function} fn The callback function
 */
Undocumented.prototype.getSiteFeatures = function ( siteDomain, fn ) {
	debug( '/sites/:site_domain:/features query' );

	return this._sendRequest(
		{
			path: `/sites/${ encodeURIComponent( siteDomain ) }/features`,
			method: 'get',
			apiVersion: '1.1',
		},
		fn
	);
};

/**
 * Return a list of third-party services that WordPress.com can integrate with for a specific site
 *
 * @param {number|string} siteId The site ID or domain
 * @param {Function} fn The callback function
 * @returns {Promise} A Promise to resolve when complete
 */

Undocumented.prototype.sitesExternalServices = function ( siteId, fn ) {
	debug( '/sites/:site-id:/external-services query' );
	return this.wpcom.req.get(
		{
			path: '/sites/' + siteId + '/external-services',
			apiNamespace: 'wpcom/v2',
		},
		fn
	);
};

/**
 * Return a list of user's connected publicize services for the given site
 *
 * @param {number|string} siteId The site ID or domain
 * @param {Function}      fn     The callback function
 * @returns {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.siteConnections = function ( siteId, fn ) {
	debug( '/sites/:site_id:/publicize-connections query' );
	return this.wpcom.req.get(
		{
			path: '/sites/' + siteId + '/publicize-connections',
			apiVersion: '1.1',
		},
		fn
	);
};

/**
 * Deletes a single site connection
 *
 * @param {number|string} siteId       The site ID or domain
 * @param {number}        connectionId The connection ID to remove
 * @param {Function}      fn           Method to invoke when request is complete
 * @returns {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.deleteSiteConnection = function ( siteId, connectionId, fn ) {
	debug( '/sites/:site_id:/publicize-connections/:connection_id:/delete query' );
	return this.wpcom.req.post(
		{
			path: '/sites/' + siteId + '/publicize-connections/' + connectionId + '/delete',
			apiVersion: '1.1',
		},
		fn
	);
};

/**
 * Delete a site
 *
 * @param  {number|string} siteId The site ID or domain
 * @param  {Function} fn Function to invoke when request is complete
 */
Undocumented.prototype.deleteSite = function ( siteId, fn ) {
	debug( '/sites/:site_id/delete query' );
	return this.wpcom.req.post( { path: '/sites/' + siteId + '/delete' }, fn );
};

/**
 * Creates a single connection using the specified Keyring connection ID and an
 *  optional `options` object, which can include a `shared` property
 *
 * @param {number}        keyringConnectionId The Keyring connection ID to use
 * @param {number|string} siteId              The site ID or domain
 * @param {string}        externalUserId      User ID if not connecting to primary account
 * @param {object}        options             Optional options
 * @param {boolean}       options.shared      Whether this connection is available to other users.
 * @param {Function}      fn                  Method to invoke when request is complete
 * @returns {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.createConnection = function (
	keyringConnectionId,
	siteId,
	externalUserId,
	options,
	fn
) {
	// Method overloading: Optional `options`
	if ( 'undefined' === typeof fn && 'function' === typeof options ) {
		fn = options;
		options = {};
	}

	// Build request body
	const body = { keyring_connection_ID: keyringConnectionId };
	if ( 'boolean' === typeof options.shared ) {
		body.shared = options.shared;
	}

	if ( externalUserId ) {
		body.external_user_ID = externalUserId;
	}

	const path = siteId
		? '/sites/' + siteId + '/publicize-connections/new'
		: '/me/publicize-connections/new';

	return this.wpcom.req.post( { path, body, apiVersion: '1.1' }, fn );
};

/**
 * Share an arbitrary post using publicize connection
 *
 * @param {number}       siteId            The site ID
 * @param {number}       postId            The post ID
 * @param {string}    message           Message for social media
 * @param {Array(int)} skippedConnections           Keyring connection ids to skip publicizing
 * @param {Function}      fn           Function to invoke when request is complete
 * @returns {Promise} A promise representing the request
 */
Undocumented.prototype.publicizePost = function (
	siteId,
	postId,
	message,
	skippedConnections,
	fn
) {
	const body = { skipped_connections: [] };

	body.message = message;

	if ( skippedConnections && skippedConnections.length > 0 ) {
		body.skipped_connections = skippedConnections;
	}

	return this.wpcom.req.post(
		{ path: `/sites/${ siteId }/posts/${ postId }/publicize`, body, apiNamespace: 'wpcom/v2' },
		fn
	);
};

/**
 * Updates a single publicize connection
 *
 * @param {number|string} siteId       An optional site ID or domain
 * @param {number}        connectionId The connection ID to update
 * @param {object}        data         The update request body
 * @param {Function}      fn           Function to invoke when request is complete
 * @returns {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.updateConnection = function ( siteId, connectionId, data, fn ) {
	let path;

	if ( siteId ) {
		debug( '/sites/:site_id:/publicize-connections/:connection_id: query' );
		path = '/sites/' + siteId + '/publicize-connections/' + connectionId;
	} else {
		debug( '/me/publicize-connections/:connection_id: query' );
		path = '/me/publicize-connections/' + connectionId;
	}

	return this.wpcom.req.post(
		{
			path: path,
			body: data,
			apiVersion: '1.1',
		},
		fn
	);
};

/**
 * POST create a payment transaction
 *
 * @param {object} [data] The REQUEST data
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 *
 * The post data format is: {
 *		payment_method: {string} The payment gateway,
 *		payment_key: {string} Either the cc token from the gateway, or the mp_ref from /me/stored_cards,
 *		payment: {object} Payment details, including payment_method and payment_key,
 *		cart: {object>shopping_cart} A Shopping cart object
 *		domain_details: {object>contact_information} Optional set of domain contact information
 *		locale: {string} Locale for translating strings in response data,
 * }
 */
Undocumented.prototype.transactions = function ( data, fn ) {
	return this.wpcom.req.post( '/me/transactions', mapKeysRecursively( data, snakeCase ), fn );
};

/**
 * GET paypal_express_url
 *
 * @param {object} [data] The GET data
 * @param {Function} fn The callback function
 * @returns {string} Url
 *
 * The data format is: {
 *		country: {string} The billing country,
 *		postal_code: {string} The billing postal code,
 *		cart: {Array} An JSON serialization of the cart,
 * }
 */
Undocumented.prototype.paypalExpressUrl = function ( data, fn ) {
	debug( '/me/paypal-express-url query' );

	data = mapKeysRecursively( data, snakeCase );

	return this.wpcom.req.post( '/me/paypal-express-url', data, fn );
};

function addReaderContentWidth( params ) {
	if ( params.content_width ) {
		return;
	}
	const contentWidth = readerContentWidth();
	if ( contentWidth ) {
		params.content_width = contentWidth;
	}
}

Undocumented.prototype.readFeedPost = function ( query, fn ) {
	const params = omit( query, [ 'feedId', 'postId' ] );
	debug( '/read/feed/' + query.feedId + '/posts/' + query.postId );
	params.apiVersion = '1.2';
	addReaderContentWidth( params );

	return this.wpcom.req.get(
		'/read/feed/' +
			encodeURIComponent( query.feedId ) +
			'/posts/' +
			encodeURIComponent( query.postId ),
		params,
		fn
	);
};

Undocumented.prototype.readTagImages = function ( query, fn ) {
	const params = omit( query, 'tag' );
	debug( '/read/tags/' + query.tag + '/images' );
	params.apiVersion = '1.2';
	return this.wpcom.req.get(
		'/read/tags/' + encodeURIComponent( query.tag ) + '/images',
		params,
		fn
	);
};

Undocumented.prototype.readSitePost = function ( query, fn ) {
	const params = omit( query, [ 'site', 'postId' ] );
	debug( '/read/sites/:site/post/:post' );
	addReaderContentWidth( params );
	return this.wpcom.req.get( '/read/sites/' + query.site + '/posts/' + query.postId, params, fn );
};

Undocumented.prototype.readSitePostRelated = function ( query, fn ) {
	debug( '/read/site/:site/post/:post/related' );
	const params = omit( query, [ 'site_id', 'post_id' ] );
	params.apiVersion = '1.2';
	addReaderContentWidth( params );
	return this.wpcom.req.get(
		'/read/site/' + query.site_id + '/post/' + query.post_id + '/related',
		params,
		fn
	);
};

Undocumented.prototype.supportAlternates = function ( query, fn ) {
	const params = omit( query, [ 'site', 'postId' ] );
	debug( '/support/alternates/:site/posts/:post' );
	addReaderContentWidth( params );
	return this.wpcom.req.get(
		'/support/alternates/' + query.site + '/posts/' + query.postId,
		params,
		fn
	);
};

/**
 * Sign up for a new user account
 * Create a new user
 *
 * @param {object} query - an object with the following values: email, username, password, first_name (optional), last_name (optional)
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersNew = function ( query, fn ) {
	debug( '/users/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	// Set the language for the user
	query.locale = getLocaleSlug();
	const args = {
		path: '/users/new',
		body: query,
	};
	return this.wpcom.req.post( args, fn );
};

/**
 * Sign up for a new account with a social service (e.g. Google/Facebook).
 *
 * @param {object} query - an object with the following values: service, access_token, id_token (optional), signup_flow_name
 * @param {Function} fn - callback
 * @returns {Promise} A promise for the request
 */
Undocumented.prototype.usersSocialNew = function ( query, fn ) {
	query.locale = getLocaleSlug();

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	const args = {
		path: '/users/social/new',
		body: query,
	};

	return this.wpcom.req.post( args, fn );
};

Undocumented.prototype.createUserAndSite = function ( query, fn ) {
	debug( '/users/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	// Set the language for the user
	query.locale = getLocaleSlug();
	const args = {
		path: '/users/new',
		body: query,
	};
	return this.wpcom.req.post( args, fn );
};

/**
 * Verify user for new signups
 *
 * @param {object} data - object containing an email address, username and password
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.validateNewUser = function ( data, fn ) {
	debug( '/signups/validation/user' );

	data.locale = getLocaleSlug();

	return this.wpcom.req.post( '/signups/validation/user/', null, data, fn );
};

/**
 * Sign up for a new passwordless user account
 *
 * @param {object} query - an object with the following values: email
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersEmailNew = function ( query, fn ) {
	debug( '/users/email/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	const args = {
		path: '/users/email/new',
		body: query,
	};
	return this.wpcom.req.post( args, fn );
};

/**
 * Verify a new passwordless user account
 *
 * @param {object} query - an object with the following values: email, code
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersEmailVerification = function ( query, fn ) {
	debug( '/users/email/verification' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	const args = {
		path: '/users/email/verification',
		body: query,
	};
	return this.wpcom.req.post( args, fn );
};

/**
 * Create a new site
 *
 * @param {object} query - object containing an site address
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.sitesNew = function ( query, fn ) {
	const localeSlug = getLocaleSlug();

	debug( '/sites/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	// Set the language for the user
	query.lang_id = getLanguage( localeSlug ).value;
	query.locale = localeSlug;

	return this.wpcom.req.post(
		{
			path: '/sites/new',
			body: query,
		},
		fn
	);
};

/**
 * Launches a private site
 *
 * @param {string} siteIdOrSlug - ID or slug of the site to be launched
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.launchSite = function ( siteIdOrSlug, fn ) {
	const path = `/sites/${ siteIdOrSlug }/launch`;
	debug( path );
	return this.wpcom.req.post( path, fn );
};

Undocumented.prototype.themes = function ( siteId, query, fn ) {
	const path = siteId ? '/sites/' + siteId + '/themes' : '/themes';
	debug( path );
	return this.wpcom.req.get( path, query, fn );
};

Undocumented.prototype.themeDetails = function ( themeId, siteId, fn ) {
	const sitePath = siteId ? `/sites/${ siteId }` : '';
	const path = `${ sitePath }/themes/${ themeId }`;
	debug( path );

	return this.wpcom.req.get(
		path,
		{
			apiVersion: '1.2',
		},
		fn
	);
};

/*
 * Hack! Calling the theme modify endpoint without specifying an action will return the full details for a theme.
 * FIXME In the long run, we should try to enable the /sites/${ siteId }/themes/${ theme } endpoint for Jetpack
 * sites so we can delete this method and use the regular `themeDetails` for Jetpack sites, too.
 */
Undocumented.prototype.jetpackThemeDetails = function ( themeId, siteId, fn ) {
	const path = `/sites/${ siteId }/themes`;
	debug( path );

	return this.wpcom.req.post(
		{
			path,
			body: {
				themes: themeId,
			},
		},
		fn
	);
};

/**
 * Install a theme from WordPress.org or WordPress.com on the given Jetpack site.
 * Whether the theme is installed from .com or .org is controlled by the themeId string
 * if it has a -wpcom suffix, .com is used.
 *
 * @param {string}    siteId   The site ID
 * @param {string}    themeId  WordPress.com theme with -wpcom suffix, WordPress.org otherwise
 * @param {Function}  fn       The callback function
 * @returns {Promise} promise
 */
Undocumented.prototype.installThemeOnJetpack = function ( siteId, themeId, fn ) {
	const path = `/sites/${ siteId }/themes/${ themeId }/install`;
	debug( path );

	return this.wpcom.req.post(
		{
			path,
		},
		fn
	);
};

/**
 * Delete a theme from Jetpack site.
 *
 * @param {number}    siteId   The site ID
 * @param {string}    themeId  The theme ID
 * @param {Function}  fn       The callback function
 * @returns {Promise} promise
 */
Undocumented.prototype.deleteThemeFromJetpack = function ( siteId, themeId, fn ) {
	const path = `/sites/${ siteId }/themes/${ themeId }/delete`;
	debug( path );

	return this.wpcom.req.post(
		{
			path,
		},
		fn
	);
};

Undocumented.prototype.activateTheme = function ( themeId, siteId, dontChangeHomepage, fn ) {
	debug( '/sites/:site_id/themes/mine' );
	return this.wpcom.req.post(
		{
			path: '/sites/' + siteId + '/themes/mine',
			body: {
				theme: themeId,
				...( dontChangeHomepage && { dont_change_homepage: true } ),
			},
		},
		fn
	);
};

Undocumented.prototype.uploadTheme = function ( siteId, file, onProgress ) {
	debug( '/sites/:site_id/themes/new' );
	return new Promise( ( resolve, rejectPromise ) => {
		const resolver = ( error, data ) => {
			error ? rejectPromise( error ) : resolve( data );
		};

		const req = this.wpcom.req.post(
			{
				path: '/sites/' + siteId + '/themes/new',
				formData: [ [ 'zip[]', file ] ],
			},
			resolver
		);

		req.upload.onprogress = onProgress;
	} );
};

Undocumented.prototype.resendIcannVerification = function ( domain, callback ) {
	return this.wpcom.req.post( '/domains/' + domain + '/resend-icann/', callback );
};

Undocumented.prototype.fetchDns = function ( domainName, fn ) {
	return this.wpcom.req.get( '/domains/' + domainName + '/dns', fn );
};

Undocumented.prototype.updateDns = function ( domain, records, fn ) {
	const body = { dns: JSON.stringify( records ) };

	return this.wpcom.req.post( '/domains/' + domain + '/dns', body, fn );
};

Undocumented.prototype.applyDnsTemplate = function (
	domain,
	provider,
	service,
	variables,
	callback
) {
	return this.wpcom.req.post(
		'/domains/' + domain + '/dns/providers/' + provider + '/services/' + service,
		{ variables },
		callback
	);
};

Undocumented.prototype.applyDnsTemplateSyncFlow = function (
	domain,
	provider,
	service,
	variables,
	callback
) {
	return this.wpcom.req.get(
		'/domain-connect/authorize/v2/domainTemplates/providers/' +
			provider +
			'/services/' +
			service +
			'/apply/authorized',
		Object.assign( {}, { apiVersion: '1.3' }, variables ),
		callback
	);
};

Undocumented.prototype.getDnsTemplateRecords = function (
	domain,
	provider,
	service,
	variables,
	callback
) {
	return this.wpcom.req.post(
		'/domains/' + domain + '/dns/providers/' + provider + '/services/' + service + '/preview',
		{ variables },
		callback
	);
};

Undocumented.prototype.transferToUser = function ( siteId, domainName, targetUserId, fn ) {
	return this.wpcom.req.post(
		'/sites/' + siteId + '/domains/' + domainName + '/transfer-to-user/' + targetUserId,
		fn
	);
};

/**
 * Transfers a domain to the specified site
 *
 * @param {number} siteId The site ID
 * @param {string} [domainName] Name of the domain
 * @param {number} [targetSiteId] The target site ID
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.transferToSite = function ( siteId, domainName, targetSiteId, fn ) {
	return this.wpcom.req.post(
		`/sites/${ siteId }/domains/${ domainName }/transfer-to-site/${ targetSiteId }`,
		fn
	);
};

/*
 * Retrieves WHOIS data for given domain.
 *
 * @param {string} [domainName]
 * @param {Function} [fn]
 */
Undocumented.prototype.fetchWhois = function ( domainName, fn ) {
	debug( '/domains/:domainName/whois query' );
	return this.wpcom.req.get( `/domains/${ domainName }/whois`, fn );
};

/*
 * Updates WHOIS data for given domain.
 *
 * @param {string} [domainName]
 * @param {object} [whois]
 * @param {Function} [fn]
 */
Undocumented.prototype.updateWhois = function ( domainName, whois, transferLock, fn ) {
	debug( '/domains/:domainName/whois' );
	return this.wpcom.req.post(
		{
			path: `/domains/${ domainName }/whois`,
			apiVersion: '1.1',
			body: {
				whois,
				transfer_lock: transferLock,
			},
		},
		fn
	);
};

/**
 * Add domain mapping for eligible clients.
 *
 * @param {number} siteId The site ID
 * @param {string} [domainName] Name of the domain mapping
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.addDomainMapping = function ( siteId, domainName, fn ) {
	debug( '/site/:site_id/add-domain-mapping' );
	return this.wpcom.req.post(
		{
			path: `/sites/${ siteId }/add-domain-mapping`,
			body: {
				domain: domainName,
			},
		},
		fn
	);
};

/**
 * Add domain mapping for VIP clients.
 *
 * @param {number} siteId The site ID
 * @param {string} [domainName] Name of the domain mapping
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.addVipDomainMapping = function ( siteId, domainName, fn ) {
	debug( '/site/:site_id/vip-domain-mapping' );
	return this.wpcom.req.post(
		{
			path: `/sites/${ siteId }/vip-domain-mapping`,
			body: {
				domain: domainName,
			},
		},
		fn
	);
};

/*
 * Change the theme of a given site.
 *
 * @param {string} [siteSlug]
 * @param {string} [data]
 * @param {Function} fn
 */
Undocumented.prototype.changeTheme = function ( siteSlug, data, fn ) {
	debug( '/site/:site_id/themes/mine' );
	return this.wpcom.req.post(
		{
			path: '/sites/' + siteSlug + '/themes/mine',
			body: data,
		},
		fn
	);
};

Undocumented.prototype.resetPasswordForMailbox = function ( domainName, mailbox, fn ) {
	debug( '/domains/:domainName/google-apps/:mailbox/get-new-password' );
	return this.wpcom.req.post(
		{
			path: '/domains/' + domainName + '/google-apps/' + mailbox + '/get-new-password',
		},
		fn
	);
};

Undocumented.prototype.isSiteImportable = function ( site_url ) {
	debug( `/wpcom/v2/imports/is-site-importable?${ site_url }` );

	return this.wpcom.req.get(
		{ path: '/imports/is-site-importable', apiNamespace: 'wpcom/v2' },
		{ site_url }
	);
};

Undocumented.prototype.fetchImporterState = function ( siteId ) {
	debug( `/sites/${ siteId }/importer/` );

	return this.wpcom.req.get( { path: `/sites/${ siteId }/imports/` } );
};

Undocumented.prototype.updateImporter = function ( siteId, importerStatus ) {
	debug( `/sites/${ siteId }/imports/${ importerStatus.importId }` );

	return this.wpcom.req.post( {
		path: `/sites/${ siteId }/imports/${ importerStatus.importerId }`,
		formData: [ [ 'importStatus', JSON.stringify( importerStatus ) ] ],
	} );
};

Undocumented.prototype.importWithSiteImporter = function (
	siteId,
	importerStatus,
	params,
	targetUrl
) {
	debug( `/sites/${ siteId }/site-importer/import-site?${ stringify( params ) }` );

	return this.wpcom.req.post( {
		path: `/sites/${ siteId }/site-importer/import-site?${ stringify( params ) }`,
		apiNamespace: 'wpcom/v2',
		formData: [
			[ 'import_status', JSON.stringify( importerStatus ) ],
			[ 'site_url', targetUrl ],
		],
	} );
};

Undocumented.prototype.uploadExportFile = function ( siteId, params ) {
	return new Promise( ( resolve, rejectPromise ) => {
		const resolver = ( error, data ) => {
			error ? rejectPromise( error ) : resolve( data );
		};

		const formData = [
			[ 'importStatus', JSON.stringify( params.importStatus ) ],
			[ 'import', params.file ],
		];

		if ( params.url ) {
			formData.push( [ 'url', params.url ] );
		}

		const req = this.wpcom.req.post(
			{
				path: `/sites/${ siteId }/imports/new`,
				formData,
			},
			resolver
		);

		req.upload.onprogress = params.onprogress;
		req.onabort = params.onabort;
	} );
};

Undocumented.prototype.cancelPlanTrial = function ( planId, fn ) {
	debug( '/upgrades/{planId}/cancel-plan-trial' );

	return this.wpcom.req.post(
		{
			path: `/upgrades/${ planId }/cancel-plan-trial`,
		},
		fn
	);
};

/**
 * Get the available export configuration settings for a site
 *
 * @param {number}       siteId            The site ID
 * @param {Function}  fn                The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.getExportSettings = function ( siteId, fn ) {
	return this.wpcom.req.get(
		{
			apiVersion: '1.1',
			path: `/sites/${ siteId }/exports/settings`,
		},
		fn
	);
};

/*
 * Start an export
 *
 * @param {number}       siteId            The site ID
 * @param {object}    advancedSettings  Advanced export configuration
 * @param {Function}  fn                The callback function
 * @returns {Promise}                   A promise that resolves when the export started
 */
Undocumented.prototype.startExport = function ( siteId, advancedSettings, fn ) {
	return this.wpcom.req.post(
		{
			apiVersion: '1.1',
			path: `/sites/${ siteId }/exports/start`,
		},
		advancedSettings,
		fn
	);
};

/**
 * Check the status of an export
 *
 * @param {number|string} siteId - The site ID
 * @param {object} exportId - Export ID (for future use)
 * @param {Function} fn - The callback function
 * @returns {Promise}  promise
 */
Undocumented.prototype.getExport = function ( siteId, exportId, fn ) {
	return this.wpcom.req.get(
		{
			apiVersion: '1.1',
			path: `/sites/${ siteId }/exports/${ exportId }`,
		},
		fn
	);
};

/**
 * Check different info about WordPress and Jetpack status on a url
 *
 * @param  {string}  inputUrl The url of the site to check. Must use http or https protocol.
 * @returns {Promise} promise  Request promise
 */
Undocumented.prototype.getSiteConnectInfo = function ( inputUrl ) {
	return this.wpcom.req.get( '/connect/site-info', { url: inputUrl } );
};

/**
 * Imports given XML file into the user's Reader feed.
 * XML file is expected to be in OPML format.
 *
 * @param {globalThis.File}     file         The File object to upload
 * @param {Function} fn           The callback function
 * @returns {globalThis.XMLHttpRequest} The XHR instance, to attach `progress`
 *   listeners to, etc.
 */
Undocumented.prototype.importReaderFeed = function ( file, fn ) {
	debug( '/read/following/mine/import' );
	const params = {
		path: '/read/following/mine/import',
		formData: [ [ 'import', file ] ],
	};
	// XXX: kind strange, wpcom.js, that `apiVersion` must be in `query`
	// *and* pass a `body` of null for this to work properly…
	const query = {
		apiVersion: '1.2',
	};
	return this.wpcom.req.post( params, query, null, fn );
};

/**
 * Creates a Push Notification registration for the device
 *
 * @param {string}     registration   The registration to be stored
 * @param {string}     deviceFamily   The device family
 * @param {string}     deviceName     The device name
 * @param {Function}   fn             The callback function
 * @returns {globalThis.XMLHttpRequest}          The XHR instance
 */
Undocumented.prototype.registerDevice = function ( registration, deviceFamily, deviceName, fn ) {
	debug( '/devices/new' );
	return this.wpcom.req.post(
		{ path: '/devices/new' },
		{},
		{
			device_token: registration,
			device_family: deviceFamily,
			device_name: deviceName,
		},
		fn
	);
};

/**
 * Removes a Push Notification registration for the device
 *
 * @param {number}        deviceId       The device ID for the registration to be removed
 * @param {Function}   fn             The callback function
 * @returns {globalThis.XMLHttpRequest}          The XHR instance
 */
Undocumented.prototype.unregisterDevice = function ( deviceId, fn ) {
	debug( '/devices/:device_id/delete' );
	return this.wpcom.req.post( { path: `/devices/${ deviceId }/delete` }, fn );
};

/**
 * Requests streamlined approval to WordAds program
 *
 * @param {number}       siteId            The site ID
 * @returns {Promise} A promise representing the request
 */
Undocumented.prototype.wordAdsApprove = function ( siteId ) {
	debug( '/sites/:site:/wordads/approve' );
	return this.wpcom.req.post( '/sites/' + siteId + '/wordads/approve' );
};

/**
 * Initiate the Automated Transfer process, uploading a theme and/or selecting
 * a community plugin.
 *
 * @param {number} siteId -- the ID of the site
 * @param {string} [plugin] -- .org plugin slug
 * @param {globalThis.File} [theme] -- theme zip to upload
 * @param {Function} [onProgress] -- called with upload progress status
 * @returns {Promise} promise for handling result
 */
Undocumented.prototype.initiateTransfer = function ( siteId, plugin, theme, onProgress ) {
	debug( '/sites/:site_id/automated-transfers/initiate' );
	return new Promise( ( resolve, rejectPromise ) => {
		const resolver = ( error, data ) => {
			error ? rejectPromise( error ) : resolve( data );
		};

		const post = {
			path: `/sites/${ siteId }/automated-transfers/initiate`,
		};

		if ( plugin ) {
			post.body = { plugin };
		}
		if ( theme ) {
			post.formData = [ [ 'theme', theme ] ];
		}

		const req = this.wpcom.req.post( post, resolver );
		req && ( req.upload.onprogress = onProgress );
	} );
};

/**
 * Fetch the status of an Automated Transfer.
 *
 * @param {number} siteId -- the ID of the site being transferred
 * @param {number} transferId -- ID of the specific transfer
 * @returns {Promise} promise for handling result
 */
Undocumented.prototype.transferStatus = function ( siteId, transferId ) {
	debug( '/sites/:site_id/automated-transfers/status/:transfer_id' );
	return this.wpcom.req.get( {
		path: `/sites/${ siteId }/automated-transfers/status/${ transferId }`,
	} );
};

/**
 * Get OAuth2 Client data for a given client ID
 *
 * @param {string}     clientId       The client ID
 * @param {Function}   fn             The callback function
 * @returns {Promise} A promise representing the request.
 */
Undocumented.prototype.oauth2ClientId = function ( clientId, fn ) {
	return this.wpcom.req.get(
		`/oauth2/client-data/${ clientId }`,
		{ apiNamespace: 'wpcom/v2' },
		fn
	);
};

/**
 * Fetch the curated list of featured plugins.
 *
 * @param {Function}   fn             The callback function
 * @returns {Promise}  A promise
 */
Undocumented.prototype.getFeaturedPlugins = function ( fn ) {
	return this.wpcom.req.get( '/plugins/featured', { apiNamespace: 'wpcom/v2' }, fn );
};

/**
 * Fetch a nonce to use in the `updateSiteAddress` call
 *
 * @param {number}   siteId  The ID of the site for which to get a nonce.
 * @returns {Promise}     A promise
 */
Undocumented.prototype.getRequestSiteAddressChangeNonce = function ( siteId ) {
	return this.wpcom.req.get( {
		path: `/sites/${ siteId }/site-address-change/nonce`,
		apiNamespace: 'wpcom/v2',
	} );
};

/**
 * Request server-side validation (including an availibility check) of the given site address.
 *
 * @param {number} siteId The siteId for which to validate
 * @param {object} [siteAddress]	The site address to validate
 * @param {string} [domain] The domain name of the new site address (ex. news.blog, wordpress.com, etc.)
 * @param {string} [type] blog/dotblog - blog for wordpress.com, dotblog for .blog domains
 * @returns {Promise}  A promise
 */
Undocumented.prototype.checkSiteAddressValidation = function ( siteId, siteAddress, domain, type ) {
	return this.wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-address-change/validate`,
			apiNamespace: 'wpcom/v2',
		},
		{},
		{ blogname: siteAddress, domain, type }
	);
};

/**
 * Request a new .wordpress.com or .*.blog address for a site with the option to discard the current.
 *
 * @param {number} siteId The siteId for which to change the address
 * @param {object} [blogname] The desired new site address
 * @param {string} [domain] The domain name of the new site address (ex. news.blog, wordpress.com, etc.)
 * @param {string} [oldDomain] The full domain name of the original site (ex. mysite.news.blog, mysite.wordpress.com, etc.)
 * @param {string} [type] blog/dotblog - blog for wordpress.com->wordpress.com, dotblog if the old and/or new domain is .blog
 * @param {boolean} [discard] Should the old site address name be discarded?
 * @param {string} [nonce] A nonce provided by the API
 * @returns {Promise}  A promise
 */
Undocumented.prototype.updateSiteAddress = function (
	siteId,
	blogname,
	domain,
	oldDomain,
	type,
	discard,
	nonce
) {
	return this.wpcom.req.post(
		{
			path: `/sites/${ siteId }/site-address-change`,
			apiNamespace: 'wpcom/v2',
		},
		{},
		{ blogname, domain, old_domain: oldDomain, type, discard, nonce }
	);
};

Undocumented.prototype.requestGdprConsentManagementLink = function ( domain, callback ) {
	return this.wpcom.req.get(
		`/domains/${ domain }/request-gdpr-consent-management-link`,
		function ( error, response ) {
			if ( error ) {
				callback( error );
				return;
			}

			callback( null, response );
		}
	);
};

Undocumented.prototype.getDomainConnectSyncUxUrl = function (
	domain,
	providerId,
	serviceId,
	redirectUri,
	callback
) {
	return this.wpcom.req.get(
		`/domains/${ domain }/dns/providers/${ providerId }/services/${ serviceId }/syncurl`,
		{ redirect_uri: redirectUri },
		callback
	);
};

Undocumented.prototype.domainsVerifyRegistrantEmail = function ( domain, email, token ) {
	return this.wpcom.req.get( `/domains/${ domain }/verify-email`, { email, token } );
};

Undocumented.prototype.domainsVerifyOutboundTransferConfirmation = function (
	domain,
	recipientId,
	token,
	command
) {
	return this.wpcom.req.get( `/domains/${ domain }/outbound-transfer-confirmation-check`, {
		recipient_id: recipientId,
		token,
		command,
	} );
};

Undocumented.prototype.getMigrationStatus = function ( targetSiteId ) {
	return this.wpcom.req.get( {
		path: `/sites/${ targetSiteId }/migration-status`,
		apiNamespace: 'wpcom/v2',
	} );
};

Undocumented.prototype.resetMigration = function ( targetSiteId ) {
	return this.wpcom.req.post( {
		path: `/sites/${ targetSiteId }/reset-migration`,
		apiNamespace: 'wpcom/v2',
	} );
};

Undocumented.prototype.startMigration = function ( sourceSiteId, targetSiteId ) {
	return this.wpcom.req.post( {
		path: `/sites/${ targetSiteId }/migrate-from/${ sourceSiteId }`,
		apiNamespace: 'wpcom/v2',
	} );
};

Undocumented.prototype.getAtomicSiteMediaViaProxy = function (
	siteIdOrSlug,
	mediaPath,
	{ query = '', maxSize }
) {
	const safeQuery = query.replace( /^\?/, '' );
	const params = {
		path: `/sites/${ siteIdOrSlug }/atomic-auth-proxy/file?path=${ mediaPath }&${ safeQuery }`,
		apiNamespace: 'wpcom/v2',
	};

	return new Promise( ( resolve, _reject ) => {
		const fetchMedia = () =>
			this.wpcom.req.get( { ...params, responseType: 'blob' }, ( error, data ) => {
				if ( error || ! ( data instanceof Blob ) ) {
					_reject( error );
				} else {
					resolve( data );
				}
			} );

		if ( ! maxSize ) {
			return fetchMedia();
		}

		return this.wpcom.req.get( { ...params, method: 'HEAD' }, ( err, data, headers ) => {
			if ( headers[ 'Content-Length' ] > maxSize ) {
				_reject( { message: 'exceeded_max_size' } );
				return;
			}

			fetchMedia();
		} );
	} );
};

Undocumented.prototype.getAtomicSiteMediaViaProxyRetry = function (
	siteIdOrSlug,
	mediaPath,
	options
) {
	let retries = 0;
	const request = () =>
		this.getAtomicSiteMediaViaProxy( siteIdOrSlug, mediaPath, options ).catch( ( error ) => {
			// Retry three times with exponential backoff times
			if ( retries < 3 ) {
				return new Promise( ( resolve ) => {
					++retries;
					setTimeout( () => {
						resolve( request() );
					}, ( retries * retries * 1000 ) / 2 );
				} );
			}

			return Promise.reject( error );
		} );

	return request();
};

/**
 * Look for a site belonging to the currently logged in user that matches the
 * anchor parameters specified.
 *
 * @param anchorFmPodcastId {string | null}  Example: 22b6608
 * @param anchorFmEpisodeId {string | null}  Example: e324a06c-3148-43a4-85d8-34c0d8222138
 * @param anchorFmSpotifyUrl {string | null} Example: https%3A%2F%2Fopen.spotify.com%2Fshow%2F6HTZdaDHjqXKDE4acYffoD%3Fsi%3DEVfDYETjQCu7pasVG5D73Q
 * @param anchorFmSite {string | null} Example: 181129564
 * @param anchorFmPost {string | null} Example: 5
 * @returns {Promise} A promise
 *    The promise should resolve to a json object containing ".location" key as {string|false} type.
 *    False - There were no matching sites detected, the user should create a new one.
 *    String - The URL to redirect the user to, to edit a new or existing post on that site.
 */
Undocumented.prototype.getMatchingAnchorSite = function (
	anchorFmPodcastId,
	anchorFmEpisodeId,
	anchorFmSpotifyUrl,
	anchorFmSite,
	anchorFmPost
) {
	const queryParts = {
		podcast: anchorFmPodcastId,
		episode: anchorFmEpisodeId,
		spotify_url: anchorFmSpotifyUrl,
		site: anchorFmSite,
		post: anchorFmPost,
	};
	Object.keys( queryParts ).forEach( ( k ) => {
		if ( queryParts[ k ] === null ) {
			delete queryParts[ k ];
		}
	} );
	return this.wpcom.req.get(
		{
			path: '/anchor',
			method: 'GET',
			apiNamespace: 'wpcom/v2',
		},
		queryParts
	);
};

export default Undocumented;
