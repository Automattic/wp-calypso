/* eslint-disable valid-jsdoc */
/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { camelCase, isPlainObject, omit, pick, reject, snakeCase } from 'lodash';

/**
 * Internal dependencies.
 */
import Site from './site';
import Me from './me';
import MailingList from './mailing-list';
import config from 'config';
import { getLanguage, getLocaleSlug } from 'lib/i18n-utils';
import readerContentWidth from 'reader/lib/content-width';

const debug = debugFactory( 'calypso:wpcom-undocumented:undocumented' );

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
 * @param {WPCOM} wpcom - The request handler
 * @returns {Undocumented} - An instance of Undocumented
 */
function Undocumented( wpcom ) {
	if ( ! ( this instanceof Undocumented ) ) {
		return new Undocumented( wpcom );
	}
	this.wpcom = wpcom;
}

Undocumented.prototype.site = function( id ) {
	return new Site( id, this.wpcom );
};

Undocumented.prototype.me = function() {
	return new Me( this.wpcom );
};

Undocumented.prototype.mailingList = function( category ) {
	return new MailingList( category, this.wpcom );
};

/*
 * Retrieve Jetpack modules data for a site with id siteid.
 * Uses the REST API of the Jetpack site.
 *
 * @param {int}      [siteId]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.getJetpackModules = function( siteId, fn ) {
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
 * @param {int} [siteId]
 * @param {string} [moduleSlug]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.jetpackModuleActivate = function( siteId, moduleSlug, fn ) {
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
 * @param {int} [siteId]
 * @param {string} [moduleSlug]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.jetpackModuleDeactivate = function( siteId, moduleSlug, fn ) {
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
 * @param {int} [siteId] The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.fetchMonitorSettings = function( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id: query' );
	return this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId }, fn );
};

Undocumented.prototype.updateMonitorSettings = function(
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
 * @param {int} [siteId] The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.disconnectJetpack = function( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id:/mine/delete query' );
	return this.wpcom.req.post( { path: '/jetpack-blogs/' + siteId + '/mine/delete' }, fn );
};

/**
 * Fetches plugin registration keys for WordPress.org sites with paid services
 *
 * @param {int} [siteId] The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.fetchJetpackKeys = function( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id:/keys query' );
	return this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId + '/keys' }, fn );
};

/**
 * Test if a Jetpack Site is connected to .com
 *
 * @param {int} [siteId] The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.testConnectionJetpack = function( siteId, fn ) {
	debug( '/jetpack-blogs/:site_id:/test-connection query' );
	return this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId + '/test-connection' }, fn );
};

/*
 * Retrieve current connection status of a Jetpack site.
 *
 * @param {int}      [siteId]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.getJetpackConnectionStatus = function( siteId, fn ) {
	return this.wpcom.req.get(
		{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
		{ path: '/jetpack/v4/connection/' },
		fn
	);
};

/*
 * Retrieve current user's connection data for a Jetpack site.
 *
 * @param {int}      [siteId]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.getJetpackUserConnectionData = function( siteId, fn ) {
	return this.wpcom.req.get(
		{ path: '/jetpack-blogs/' + siteId + '/rest-api/' },
		{ path: '/jetpack/v4/connection/data/' },
		fn
	);
};

Undocumented.prototype.jetpackLogin = function( siteId, _wp_nonce, redirect_uri, scope, state ) {
	debug( '/jetpack-blogs/:site_id:/jetpack-login query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/jetpack-login';
	const params = { _wp_nonce, redirect_uri, scope, state };
	return this.wpcom.req.get( { path: endpointUrl }, params );
};

Undocumented.prototype.jetpackAuthorize = function(
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

Undocumented.prototype.jetpackValidateSSONonce = function( siteId, ssoNonce, fn ) {
	debug( '/jetpack-blogs/:site_id:/sso-validate query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/sso-validate';
	const params = { sso_nonce: ssoNonce };
	return this.wpcom.req.post( { path: endpointUrl }, params, fn );
};

Undocumented.prototype.jetpackAuthorizeSSONonce = function( siteId, ssoNonce, fn ) {
	debug( '/jetpack-blogs/:site_id:/sso-authorize query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/sso-authorize';
	const params = { sso_nonce: ssoNonce };
	return this.wpcom.req.post( { path: endpointUrl }, params, fn );
};

Undocumented.prototype.jetpackIsUserConnected = function( siteId ) {
	debug( '/sites/:site_id:/jetpack-connect/is-user-connected query' );
	const endpointUrl = '/sites/' + siteId + '/jetpack-connect/is-user-connected';
	return this.wpcom.req.get( { path: endpointUrl, apiNamespace: 'wpcom/v2' } );
};

/**
 * Gets the current status of a full sync for a Jetpack site.
 *
 * @param {int|string} siteId The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getJetpackSyncStatus = function( siteId, fn ) {
	debug( '/sites/:site_id:/sync/status query' );
	const endpointPath = '/sites/' + siteId + '/sync/status';
	return this.wpcom.req.get( { path: endpointPath }, fn );
};

/**
 * Schedules a full sync for a Jetpack site.
 *
 * @param {int|string} siteId The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.scheduleJetpackFullysync = function( siteId, fn ) {
	debug( '/sites/:site_id:/sync query' );
	const endpointPath = '/sites/' + siteId + '/sync';
	return this.wpcom.req.post( { path: endpointPath }, {}, fn );
};

Undocumented.prototype.invitesList = function( siteId, data = {}, fn ) {
	debug( '/sites/:site_id:/invites query', siteId, data );
	return this.wpcom.req.get( '/sites/' + siteId + '/invites', data, fn );
};

Undocumented.prototype.getInvite = function( siteId, inviteKey, fn ) {
	debug( '/sites/:site_id:/invites/:inviteKey:/ query' );
	return this.wpcom.req.get( { path: '/sites/' + siteId + '/invites/' + inviteKey }, fn );
};

Undocumented.prototype.acceptInvite = function( invite, fn ) {
	debug( '/sites/:site_id:/invites/:inviteKey:/accept query' );
	const apiVersion = '1.2';

	return this.wpcom.req.get(
		'/sites/' + invite.site.ID + '/invites/' + invite.inviteKey + '/accept',
		{
			activate: invite.activationKey,
			include_domain_only: true,
			apiVersion,
		},
		fn
	);
};

Undocumented.prototype.sendInvites = function( siteId, usernamesOrEmails, role, message, fn ) {
	debug( '/sites/:site_id:/invites/new query' );
	return this.wpcom.req.post(
		'/sites/' + siteId + '/invites/new',
		{},
		{
			invitees: usernamesOrEmails,
			role: role,
			message: message,
			source: 'calypso',
		},
		fn
	);
};

Undocumented.prototype.resendInvite = function( siteId, inviteId, fn ) {
	debug( '/sites/:site_id:/invites/:invite_id:/resend query' );
	return this.wpcom.req.post( '/sites/' + siteId + '/invites/' + inviteId + '/resend', {}, {}, fn );
};

Undocumented.prototype.createInviteValidation = function( siteId, usernamesOrEmails, role, fn ) {
	debug( '/sites/:site_id:/invites/validate query' );
	return this.wpcom.req.post(
		'/sites/' + siteId + '/invites/validate',
		{},
		{
			invitees: usernamesOrEmails,
			role: role,
		},
		fn
	);
};

/**
 * GET/POST site settings
 *
 * @param {int|string} [siteId] The site ID
 * @param {string} [method] The request method
 * @param {object} [data] The POST data
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.settings = function( siteId, method = 'get', data = {}, fn ) {
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
 * @param {int|string} [siteId] The site ID
 * @param {Function} fn The callback function
 * @api public
 *
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.getSiteKeyrings = function getSiteKeyrings( siteId, fn ) {
	return this.wpcom.req.get( '/sites/' + siteId + '/keyrings', { apiVersion: '1.1' }, fn );
};

/**
 * Create a site keyring
 *
 * @param {int|string} [siteId] The site ID
 * @param {Object} [data] site keyring object to create with properties:
 * 	- keyring_id {int} the keyring id link the site to
 * 	- external_user_id {string} Optional. The external user id to link the site to
 * 	- service {string} service name for this keyring id
 * @param {Function} fn The callback function
 * @api public
 *
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.createSiteKeyring = function createSiteKeyring( siteId, data, fn ) {
	return this.wpcom.req.post( '/sites/' + siteId + '/keyrings', { apiVersion: '1.1' }, data, fn );
};

/**
 * Update a site keyring
 *
 * @param {int|string} [siteId] The site ID
 * @param {int} [keyringId] The keyring id to update,
 * @param {string} [externalUserId] The external user id to update on the site keyring
 * @param {Function} fn The callback function
 * @api public
 *
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
 * @param {int|string} [siteId] The site ID
 * @param {int} keyringId The keyring id
 * @param {string|null} externalUserId Optional, the external user id
 * @param {Function} fn The callback function
 * @api public
 *
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

Undocumented.prototype._sendRequest = function( originalParams, fn ) {
	const { apiVersion, method } = originalParams,
		updatedParams = omit( originalParams, [ 'apiVersion', 'method' ] );

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
 * @param {int} blogId - Optional blogId to determine if domain is used on another site.
 * @param {boolean} isCartPreCheck - specifies whether this availability check is for a domain about to be added to the cart.
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.isDomainAvailable = function( domain, blogId, isCartPreCheck, fn ) {
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
 * @api public
 */
Undocumented.prototype.checkAuthCode = function( domain, authCode, fn ) {
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
 * @api public
 */
Undocumented.prototype.getInboundTransferStatus = function( domain, fn ) {
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
 * @param {int|string} siteId The site ID
 * @param {string} domain The domain name
 * @param {string} authCode The auth code for the transfer
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.startInboundTransfer = function( siteId, domain, authCode, fn ) {
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
 * Initiates a resend of the inbound transfer verification email.
 * @param {string} domain - The domain name to check.
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.resendInboundTransferEmail = function( domain, fn ) {
	return this.wpcom.req.get(
		{
			path: `/domains/${ encodeURIComponent( domain ) }/resend-inbound-transfer-email`,
		},
		fn
	);
};

/**
 * Fetches a list of available top-level domain names ordered by popularity.
 *
 * @param {object} query Optional query parameters
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.getAvailableTlds = function( query = {} ) {
	return this.wpcom.req.get( '/domains/suggestions/tlds', query );
};

/**
 * Determine whether a domain name can be used for Site Redirect
 *
 * @param {int|string} siteId The site ID
 * @param {string} domain The domain name to check
 * @param {function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.canRedirect = function( siteId, domain, fn ) {
	domain = encodeURIComponent( domain.toLowerCase() );

	return this.wpcom.req.get( { path: '/domains/' + siteId + '/' + domain + '/can-redirect' }, fn );
};

/**
 * Retrieves the target of the site redirect.
 *
 * @param {int|string} siteId The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getSiteRedirect = function( siteId, fn ) {
	debug( '/sites/:site_id/domains/redirect query' );

	return this.wpcom.req.get( { path: '/sites/' + siteId + '/domains/redirect' }, fn );
};

/**
 * Points the site redirect to the specified location.
 *
 * @param {int|string} siteId The site ID
 * @param {string} location The location to redirect the site to
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.setSiteRedirect = function( siteId, location, fn ) {
	debug( '/sites/:site_id/domains/redirect' );

	return this.wpcom.req.post(
		{ path: '/sites/' + siteId + '/domains/redirect' },
		{ location },
		fn
	);
};

/**
 * Retrieves the domain contact information of the user.
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getDomainContactInformation = function( fn ) {
	debug( '/me/domain-contact-information query' );

	return this._sendRequest(
		{
			path: '/me/domain-contact-information',
			method: 'get',
		},
		function( error, data ) {
			if ( error ) {
				return fn( error );
			}

			const newData = mapKeysRecursively( data, function( key ) {
				return key === '_headers' ? key : camelCase( key );
			} );

			fn( null, newData );
		}
	);
};

Undocumented.prototype.getDomainRegistrationSupportedStates = function( countryCode, fn ) {
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
	return Object.keys( object ).reduce( function( mapped, key ) {
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
 * @param {Object} contactInformation - user's contact information
 * @param {string[]} domainNames - list of domain names
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.validateDomainContactInformation = function(
	contactInformation,
	domainNames,
	fn
) {
	let data = {
		contactInformation: contactInformation,
		domainNames: domainNames,
	};

	debug( '/me/domain-contact-information/validate query' );
	data = mapKeysRecursively( data, snakeCase );

	return this.wpcom.req.post( { path: '/me/domain-contact-information/validate' }, data, function(
		error,
		successData
	) {
		if ( error ) {
			return fn( error );
		}

		const newData = mapKeysRecursively( successData, function( key ) {
			return key === '_headers' ? key : camelCase( key );
		} );

		fn( null, newData );
	} );
};

/**
 * Validates the specified Google Apps contact information
 *
 * @param {Object} contactInformation - user's contact information
 * @param {Function} callback The callback function
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.validateGoogleAppsContactInformation = function(
	contactInformation,
	callback
) {
	const data = mapKeysRecursively( { contactInformation }, snakeCase );

	return this.wpcom.req.post(
		{ path: '/me/google-apps/validate' },
		data,
		( error, successData ) => {
			if ( error ) {
				return callback( error );
			}

			const newData = mapKeysRecursively( successData, key => {
				return key === '_headers' ? key : camelCase( key );
			} );

			callback( null, newData );
		}
	);
};

/**
 * Get a list of WordPress.com products
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getProducts = function( fn ) {
	debug( '/products query' );
	return this._sendRequest(
		{
			path: '/products',
			method: 'get',
		},
		fn
	);
};

/**
 * Get a site specific details for WordPress.com plans
 *
 * @param {Function} siteDomain The site slug
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getSitePlans = function( siteDomain, fn ) {
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
 * Get cart.
 *
 * @param {string} cartKey The cart's key.
 * @param {Function} fn The callback function.
 * @api public
 */
Undocumented.prototype.getCart = function( cartKey, fn ) {
	debug( 'GET: /me/shopping-cart/:cart-key' );

	this._sendRequest(
		{
			path: '/me/shopping-cart/' + cartKey,
			method: 'GET',
		},
		fn
	);
};

/**
 * Set cart.
 *
 * @param {string} cartKey The cart's key.
 * @param {object} data The POST data.
 * @param {Function} fn The callback function.
 * @api public
 */
Undocumented.prototype.setCart = function( cartKey, data, fn ) {
	debug( 'POST: /me/shopping-cart/:cart-key', data );

	this._sendRequest(
		{
			path: '/me/shopping-cart/' + cartKey,
			method: 'POST',
			body: data,
		},
		fn
	);
};

/**
 * Get a list of the user's stored cards
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getStoredCards = function( fn ) {
	debug( '/me/stored-cards query' );
	return this.wpcom.req.get( { path: '/me/stored-cards' }, fn );
};

/**
 * Return a list of third-party services that WordPress.com can integrate with
 *
 * @param {Function} fn The callback function
 * @return {Promise} A Promise to resolve when complete
 * @api public
 */
Undocumented.prototype.metaKeyring = function( fn ) {
	debug( '/meta/external-services query' );
	return this.wpcom.req.get(
		{
			path: '/meta/external-services/',
			apiVersion: '1.1',
		},
		fn
	);
};

/**
 * Return a list of happiness engineers gravatar urls
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getHappinessEngineers = function( fn ) {
	debug( 'meta/happiness-engineers/ query' );

	return this.wpcom.req.get( { path: '/meta/happiness-engineers/' }, fn );
};

/**
 * Return a list of sharing buttons for the specified site, with optional
 * query parameters
 *
 * @param {int|string} siteId The site ID or domain
 * @param {object} query Optional query parameters
 * @param {Function} fn Method to invoke when request is complete
 * @api public
 */
Undocumented.prototype.sharingButtons = function( siteId, query, fn ) {
	if ( 'undefined' === typeof fn && 'function' === typeof query ) {
		fn = query;
		query = {};
	}

	debug( '/sites/:site_id:/sharing-buttons query' );
	return this.wpcom.req.get( '/sites/' + siteId + '/sharing-buttons', query, fn );
};

/**
 * Saves the set of sharing buttons for the specified site
 *
 * @param {int|string} siteId The site ID or domain
 * @param {Array} buttons An array of sharing button objects
 * @param {Function} fn Method to invoke when request is complete
 * @api public
 */
Undocumented.prototype.saveSharingButtons = function( siteId, buttons, fn ) {
	debug( '/sites/:site_id:/sharing-buttons query' );
	return this.wpcom.req.post(
		{
			path: '/sites/' + siteId + '/sharing-buttons',
			body: { sharing_buttons: buttons },
			apiVersion: '1.1',
		},
		fn
	);
};

/**
 * Return a list of user's connected services
 *
 * @param {Function} fn The callback function
 * @api public
 * @return {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.mekeyringConnections = function( forceExternalUsersRefetch, fn ) {
	debug( '/me/keyring-connections query' );

	// set defaults, first argument is actually a callback
	if ( typeof forceExternalUsersRefetch === 'function' ) {
		fn = forceExternalUsersRefetch;
		forceExternalUsersRefetch = false;
	}

	return this.wpcom.req.get(
		'/me/keyring-connections',
		forceExternalUsersRefetch ? { force_external_users_refetch: forceExternalUsersRefetch } : {},
		fn
	);
};

/**
 * Deletes a single keyring connection for the current user
 *
 * @param {int} keyringConnectionId The keyring connection ID to remove
 * @param {Function} fn Method to invoke when request is complete
 */
Undocumented.prototype.deletekeyringConnection = function( keyringConnectionId, fn ) {
	debug( '/me/keyring-connections/:keyring_connection_id:/delete query' );
	return this.wpcom.req.post(
		{
			path: '/me/keyring-connections/' + keyringConnectionId + '/delete',
			apiVersion: '1.1',
		},
		fn
	);
};

/**
 * Return a list of user's connected publicize services for the given site
 *
 * @param {Number|String} siteId The site ID or domain
 * @param {Function}      fn     The callback function
 * @api public
 * @return {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.siteConnections = function( siteId, fn ) {
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
 * @param {Number|String} siteId       The site ID or domain
 * @param {Number}        connectionId The connection ID to remove
 * @param {Function}      fn           Method to invoke when request is complete
 * @return {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.deleteSiteConnection = function( siteId, connectionId, fn ) {
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
 * @param  {int|string} siteId The site ID or domain
 * @param  {Function} fn Function to invoke when request is complete
 */
Undocumented.prototype.deleteSite = function( siteId, fn ) {
	debug( '/sites/:site_id/delete query' );
	return this.wpcom.req.post( { path: '/sites/' + siteId + '/delete' }, fn );
};

/**
 * Creates a single connection using the specified Keyring connection ID and an
 *  optional `options` object, which can include a `shared` property
 *
 * @param {Number}        keyringConnectionId The Keyring connection ID to use
 * @param {Number|String} siteId              The site ID or domain
 * @param {String}        externalUserId      User ID if not connecting to primary account
 * @param {Object}        options             Optional options
 * @param {Boolean}       options.shared      Whether this connection is available to other users.
 * @param {Function}      fn                  Method to invoke when request is complete
 * @return {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.createConnection = function(
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
 * @param {int}       siteId            The site ID
 * @param {int}       postId            The post ID
 * @param {String}    message           Message for social media
 * @param {Array(int)}skipped           CKeyring connection ids to skip publicizing
 *
 * @returns {Promise}
 */
Undocumented.prototype.publicizePost = function( siteId, postId, message, skippedConnections, fn ) {
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
 * @param {Number|String} siteId       An optional site ID or domain
 * @param {Number}        connectionId The connection ID to update
 * @param {Object}        data         The update request body
 * @param {Function}      fn           Function to invoke when request is complete
 * @return {Promise} A Promise to resolve when complete.
 */
Undocumented.prototype.updateConnection = function( siteId, connectionId, data, fn ) {
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
 * GET/POST transactions
 *
 * @param {string} [method] The request method
 * @param {object} [data] The REQUEST data
 * @param {Function} fn The callback function
 * @api public
 *
 * The post data format is: {
 *		payment_method: {string} The payment gateway,
 *		payment_key: {string} Either the cc token from the gateway, or the mp_ref from /me/stored_cards,
 *		products: {array} An array of products from the card,
 *		coupon: {string} A coupon code,
 *		currency: {string} The three letter currency code,
 * }
 */
Undocumented.prototype.transactions = function( method, data, fn ) {
	debug( '/me/transactions query' );

	if ( 'function' === typeof method ) {
		fn = method;
		method = 'get';
		data = {};
	} else {
		data = mapKeysRecursively( data, snakeCase );
	}

	return this._sendRequest(
		{
			path: '/me/transactions',
			method: method,
			body: data,
		},
		fn
	);
};

Undocumented.prototype.updateCreditCard = function( params, fn ) {
	const data = pick( params, [ 'country', 'zip', 'month', 'year', 'name' ] );
	data.paygate_token = params.cardToken;

	return this.wpcom.req.post( '/upgrades/' + params.purchaseId + '/update-credit-card', data, fn );
};

/**
 * GET paygate configuration
 *
 * @param {Object} query - query parameters
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.paygateConfiguration = function( query, fn ) {
	debug( '/me/paygate-configuration query' );

	return this.wpcom.req.get( '/me/paygate-configuration', query, fn );
};

/**
 * GET ebanx js configuration
 *
 * @param {Object} query - query parameters
 * @param {Function} fn The callback function
 * @api public
 *
 * @returns {Promise} promise
 */
Undocumented.prototype.ebanxConfiguration = function( query, fn ) {
	debug( '/me/ebanx-configuration query' );

	return this.wpcom.req.get( '/me/ebanx-configuration', query, fn );
};

/**
 * GET emergent paywall iframe client configuration
 *
 * @param {string} countryCode - user's country code
 * @param {object} cart - current cart object. See: client/lib/cart/store/index.js
 * @param {Function} fn The callback function
 * @api public
 *
 * @returns {Promise} promise
 */
Undocumented.prototype.emergentPaywallConfiguration = function(
	countryCode,
	cart,
	domainDetails,
	fn
) {
	debug( '/me/emergent-paywall-configuration query' );

	const data = mapKeysRecursively(
		{
			country: countryCode,
			cart,
			domainDetails,
		},
		snakeCase
	);

	return this.wpcom.req.post( '/me/emergent-paywall-configuration', data, fn );
};

/**
 * GET paypal_express_url
 *
 * @param {object} [data] The GET data
 * @param {Function} fn The callback function
 * @api public
 *
 * @returns {string} Url
 *
 * The data format is: {
 *		country: {string} The billing country,
 *		postal_code: {string} The billing postal code,
 *		cart: {array} An JSON serialization of the cart,
 * }
 */
Undocumented.prototype.paypalExpressUrl = function( data, fn ) {
	debug( '/me/paypal-express-url query' );

	data = mapKeysRecursively( data, snakeCase );

	return this.wpcom.req.post( '/me/paypal-express-url', data, fn );
};

/**
 * Update primary domain for blog
 *
 * @param {int} siteId The site ID
 * @param {string} domain The domain to set as primary
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.setPrimaryDomain = function( siteId, domain, fn ) {
	debug( '/sites/:site_id/domains/primary' );
	return this.wpcom.req.post( '/sites/' + siteId + '/domains/primary', {}, { domain: domain }, fn );
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

Undocumented.prototype.discoverFeed = function( query, fn ) {
	debug( '/read/feed' );
	return this.wpcom.req.get( '/read/feed/', query, fn );
};

Undocumented.prototype.readFeedPost = function( query, fn ) {
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

Undocumented.prototype.readTagImages = function( query, fn ) {
	const params = omit( query, 'tag' );
	debug( '/read/tags/' + query.tag + '/images' );
	params.apiVersion = '1.2';
	return this.wpcom.req.get(
		'/read/tags/' + encodeURIComponent( query.tag ) + '/images',
		params,
		fn
	);
};

Undocumented.prototype.readList = function( query, fn ) {
	const params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/list' );
	params.apiVersion = '1.2';
	return this.wpcom.req.get( '/read/lists/' + query.owner + '/' + query.slug, params, fn );
};

Undocumented.prototype.readLists = function( fn ) {
	debug( '/read/lists' );
	return this.wpcom.req.get( '/read/lists', { apiVersion: '1.2' }, fn );
};

Undocumented.prototype.readListsUpdate = function( query, fn ) {
	const params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:list/update' );
	return this.wpcom.req.post(
		'/read/lists/' +
			encodeURIComponent( query.owner ) +
			'/' +
			encodeURIComponent( query.slug ) +
			'/update',
		{ apiVersion: '1.2' },
		params,
		fn
	);
};

Undocumented.prototype.followList = function( query, fn ) {
	const params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:owner/:slug/follow' );
	return this.wpcom.req.post(
		'/read/lists/' +
			encodeURIComponent( query.owner ) +
			'/' +
			encodeURIComponent( query.slug ) +
			'/follow',
		{ apiVersion: '1.2' },
		params,
		fn
	);
};

Undocumented.prototype.unfollowList = function( query, fn ) {
	const params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:owner/:slug/unfollow' );
	return this.wpcom.req.post(
		'/read/lists/' +
			encodeURIComponent( query.owner ) +
			'/' +
			encodeURIComponent( query.slug ) +
			'/unfollow',
		{ apiVersion: '1.2' },
		params,
		fn
	);
};

Undocumented.prototype.readSitePost = function( query, fn ) {
	const params = omit( query, [ 'site', 'postId' ] );
	debug( '/read/sites/:site/post/:post' );
	addReaderContentWidth( params );
	return this.wpcom.req.get( '/read/sites/' + query.site + '/posts/' + query.postId, params, fn );
};

Undocumented.prototype.readSitePostRelated = function( query, fn ) {
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

/**
 * Saves a user's A/B test variation on the backend
 *
 * @param {string} name - The name of the A/B test. No leading 'abtest_' needed
 * @param {string} variation - The variation the user is assigned to
 * @param {Function} callback - Function to invoke when request is complete
 * @api public
 * @returns {Object} wpcomRequest
 */
Undocumented.prototype.saveABTestData = function( name, variation, callback ) {
	const body = {
		name,
		variation,
	};
	debug( `POST /me/abtests with ${ JSON.stringify( body ) }` );
	return this.wpcom.req.post(
		{
			path: '/me/abtests',
			body,
		},
		callback
	);
};

/**
 * Sign up for a new user account
 * Create a new user
 *
 * @param {object} query - an object with the following values: email, username, password, first_name (optional), last_name (optional)
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersNew = function( query, fn ) {
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
 *
 * @return {Promise} A promise for the request
 */
Undocumented.prototype.usersSocialNew = function( query, fn ) {
	query.locale = getLocaleSlug();

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	const args = {
		path: '/users/social/new',
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
Undocumented.prototype.validateNewUser = function( data, fn ) {
	debug( '/signups/validation/user' );

	data.locale = getLocaleSlug();

	return this.wpcom.req.post( '/signups/validation/user/', null, data, fn );
};

/**
 * Request a "Magic Login" email be sent to a user so they can use it to log in
 * @param  {object} data - object containing an email address
 * @param  {Function} fn - Function to invoke when request is complete
 * @returns {Promise} promise
 */
Undocumented.prototype.requestMagicLoginEmail = function( data, fn ) {
	restrictByOauthKeys( data );

	data.locale = getLocaleSlug();
	data.lang_id = getLanguage( data.locale ).value;

	return this.wpcom.req.post(
		'/auth/send-login-email',
		{
			apiVersion: '1.2',
		},
		data,
		fn
	);
};

/**
 * Create a new site
 *
 * @param {object} query - object containing an site address
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.sitesNew = function( query, fn ) {
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

Undocumented.prototype.themes = function( siteId, query, fn ) {
	const path = siteId ? '/sites/' + siteId + '/themes' : '/themes';
	debug( path );
	return this.wpcom.req.get( path, query, fn );
};

Undocumented.prototype.themeDetails = function( themeId, siteId, fn ) {
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
Undocumented.prototype.jetpackThemeDetails = function( themeId, siteId, fn ) {
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
 * @param {String}    siteId   The site ID
 * @param {String}    themeId  WordPress.com theme with -wpcom suffix, WordPress.org otherwise
 * @param {Function}  fn       The callback function
 * @returns {Promise} promise
 */
Undocumented.prototype.installThemeOnJetpack = function( siteId, themeId, fn ) {
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
 * @param {Number}    siteId   The site ID
 * @param {String}    themeId  The theme ID
 * @param {Function}  fn       The callback function
 * @returns {Promise} promise
 */
Undocumented.prototype.deleteThemeFromJetpack = function( siteId, themeId, fn ) {
	const path = `/sites/${ siteId }/themes/${ themeId }/delete`;
	debug( path );

	return this.wpcom.req.post(
		{
			path,
		},
		fn
	);
};

Undocumented.prototype.activeTheme = function( siteId, fn ) {
	debug( '/sites/:site_id/themes/mine' );
	return this.wpcom.req.get( { path: '/sites/' + siteId + '/themes/mine' }, fn );
};

Undocumented.prototype.activateTheme = function( themeId, siteId, fn ) {
	debug( '/sites/:site_id/themes/mine' );
	return this.wpcom.req.post(
		{
			path: '/sites/' + siteId + '/themes/mine',
			body: { theme: themeId },
		},
		fn
	);
};

Undocumented.prototype.uploadTheme = function( siteId, file, onProgress ) {
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

Undocumented.prototype.emailForwards = function( domain, callback ) {
	return this.wpcom.req.get( '/domains/' + domain + '/email', function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.addEmailForward = function( domain, mailbox, destination, callback ) {
	return this.wpcom.req.post(
		'/domains/' + domain + '/email/new',
		{},
		{
			mailbox: mailbox,
			destination: destination,
		},
		function( error, response ) {
			if ( error ) {
				callback( error );
				return;
			}

			callback( null, response );
		}
	);
};

Undocumented.prototype.deleteEmailForward = function( domain, mailbox, callback ) {
	return this.wpcom.req.post(
		'/domains/' + domain + '/email/' + mailbox + '/delete',
		{},
		{},
		function( error, response ) {
			if ( error ) {
				callback( error );
				return;
			}

			callback( null, response );
		}
	);
};

Undocumented.prototype.resendVerificationEmailForward = function( domain, mailbox, callback ) {
	return this.wpcom.req.post(
		'/domains/' + domain + '/email/' + mailbox + '/resend-verification',
		{},
		{},
		function( error, response ) {
			if ( error ) {
				callback( error );
				return;
			}

			callback( null, response );
		}
	);
};

Undocumented.prototype.nameservers = function( domain, callback ) {
	return this.wpcom.req.get( '/domains/' + domain + '/nameservers', function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.updateNameservers = function( domain, nameservers, callback ) {
	return this.wpcom.req.post( '/domains/' + domain + '/nameservers/', {}, nameservers, function(
		error,
		response
	) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.resendIcannVerification = function( domain, callback ) {
	return this.wpcom.req.post( '/domains/' + domain + '/resend-icann/', callback );
};

Undocumented.prototype.fetchDns = function( domainName, fn ) {
	return this.wpcom.req.get( '/domains/' + domainName + '/dns', fn );
};

Undocumented.prototype.updateDns = function( domain, records, fn ) {
	const filtered = reject( records, 'isBeingDeleted' ),
		body = { dns: JSON.stringify( filtered ) };

	return this.wpcom.req.post( '/domains/' + domain + '/dns', body, fn );
};

Undocumented.prototype.applyDnsTemplate = function(
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

Undocumented.prototype.applyDnsTemplateSyncFlow = function(
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

Undocumented.prototype.getDnsTemplateRecords = function(
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

Undocumented.prototype.fetchWapiDomainInfo = function( domainName, fn ) {
	return this.wpcom.req.get( '/domains/' + domainName + '/status', fn );
};

Undocumented.prototype.requestTransferCode = function( options, fn ) {
	const { domainName } = options,
		data = {
			domainStatus: JSON.stringify( {
				command: 'send-code',
			} ),
		};

	return this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.cancelTransferRequest = function( { domainName, declineTransfer }, fn ) {
	const data = {
		domainStatus: JSON.stringify( {
			command: 'cancel-transfer-request',
			payload: {
				decline_transfer: declineTransfer,
			},
		} ),
	};

	return this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.enablePrivacyProtection = function( domainName, callback ) {
	return this.wpcom.req.post( '/domains/' + domainName + '/privacy/enable', callback );
};

Undocumented.prototype.disablePrivacyProtection = function( domainName, callback ) {
	return this.wpcom.req.post( '/domains/' + domainName + '/privacy/disable', callback );
};

Undocumented.prototype.acceptTransfer = function( domainName, fn ) {
	const data = {
		domainStatus: JSON.stringify( { command: 'accept-transfer' } ),
	};

	return this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.declineTransfer = function( domainName, fn ) {
	const data = {
		domainStatus: JSON.stringify( { command: 'deny-transfer' } ),
	};

	return this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.transferToUser = function( siteId, domainName, targetUserId, fn ) {
	return this.wpcom.req.post(
		'/sites/' + siteId + '/domains/' + domainName + '/transfer-to-user/' + targetUserId,
		fn
	);
};

/**
 * Transfers a domain to the specified site
 *
 * @param {int} [siteId] The site ID
 * @param {string} [domainName] Name of the domain
 * @param {int} [targetSiteId] The target site ID
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.transferToSite = function( siteId, domainName, targetSiteId, fn ) {
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
Undocumented.prototype.fetchWhois = function( domainName, fn ) {
	debug( '/domains/:domainName/whois query' );
	return this.wpcom.req.get( `/domains/${ domainName }/whois`, fn );
};

/*
 * Updates WHOIS data for given domain.
 *
 * @param {string} [domainName]
 * @param {Object} [whois]
 * @param {Function} [fn]
 */
Undocumented.prototype.updateWhois = function( domainName, whois, transferLock, fn ) {
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
 * Add domain mapping for VIP clients.
 *
 * @param {int} [siteId] The site ID
 * @param {string} [domainName] Name of the domain mapping
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 */
Undocumented.prototype.addVipDomainMapping = function( siteId, domainName, fn ) {
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
 * @api public
 */
Undocumented.prototype.changeTheme = function( siteSlug, data, fn ) {
	debug( '/site/:site_id/themes/mine' );
	return this.wpcom.req.post(
		{
			path: '/sites/' + siteSlug + '/themes/mine',
			body: data,
		},
		fn
	);
};

Undocumented.prototype.sitePurchases = function( siteId, fn ) {
	debug( '/site/:site_id/purchases' );
	return this.wpcom.req.get( { path: '/sites/' + siteId + '/purchases' }, fn );
};

Undocumented.prototype.googleAppsFilterByDomain = function( domainName, fn ) {
	debug( '/domains/:domainName/google-apps' );
	return this.wpcom.req.get( { path: '/domains/' + domainName + '/google-apps' }, fn );
};

Undocumented.prototype.googleAppsFilterBySiteId = function( siteId, fn ) {
	debug( '/sites/:siteId/google-apps' );
	return this.wpcom.req.get( { path: '/sites/' + siteId + '/google-apps' }, fn );
};

Undocumented.prototype.isSiteImportable = function( site_url ) {
	debug( `/wpcom/v2/site-importer-global/is-site-importable?${ site_url }` );

	return this.wpcom.req.get(
		{ path: '/site-importer-global/is-site-importable', apiNamespace: 'wpcom/v2' },
		{ site_url }
	);
};

Undocumented.prototype.fetchImporterState = function( siteId ) {
	debug( `/sites/${ siteId }/importer/` );

	return this.wpcom.req.get( { path: `/sites/${ siteId }/imports/` } );
};

Undocumented.prototype.updateImporter = function( siteId, importerStatus ) {
	debug( `/sites/${ siteId }/imports/${ importerStatus.importId }` );

	return this.wpcom.req.post( {
		path: `/sites/${ siteId }/imports/${ importerStatus.importerId }`,
		formData: [ [ 'importStatus', JSON.stringify( importerStatus ) ] ],
	} );
};

Undocumented.prototype.uploadExportFile = function( siteId, params ) {
	return new Promise( ( resolve, rejectPromise ) => {
		const resolver = ( error, data ) => {
			error ? rejectPromise( error ) : resolve( data );
		};

		const req = this.wpcom.req.post(
			{
				path: `/sites/${ siteId }/imports/new`,
				formData: [
					[ 'importStatus', JSON.stringify( params.importStatus ) ],
					[ 'import', params.file ],
				],
			},
			resolver
		);

		req.upload.onprogress = params.onprogress;
		req.onabort = params.onabort;
	} );
};

/**
 * GET help links
 *
 * @param {string} searchQuery User input for help search
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getHelpLinks = function( searchQuery, fn ) {
	debug( 'help-search/ searchQuery' );
	return this.wpcom.req.get( '/help/search', { query: searchQuery, include_post_id: 1 }, fn );
};

Undocumented.prototype.getQandA = function( query, site, fn ) {
	debug( 'help-contact-qanda/ searchQuery {query}' );

	return this.wpcom.req.get(
		'/help/qanda',
		{
			query,
			site,
		},
		fn
	);
};

Undocumented.prototype.cancelPurchase = function( purchaseId, fn ) {
	debug( 'upgrades/{purchaseId}/disable-auto-renew' );

	return this.wpcom.req.post(
		{
			path: `/upgrades/${ purchaseId }/disable-auto-renew`,
		},
		fn
	);
};

Undocumented.prototype.cancelAndRefundPurchase = function( purchaseId, data, fn ) {
	debug( 'upgrades/{purchaseId}/cancel' );

	return this.wpcom.req.post(
		{
			path: `/upgrades/${ purchaseId }/cancel`,
			body: data,
		},
		fn
	);
};

Undocumented.prototype.cancelPrivacyProtection = function( purchaseId, fn ) {
	debug( 'upgrades/{purchaseId}/cancel-privacy-protection' );

	return this.wpcom.req.post(
		{
			path: `/upgrades/${ purchaseId }/cancel-privacy-protection`,
			apiVersion: '1.1',
		},
		fn
	);
};

Undocumented.prototype.cancelPlanTrial = function( planId, fn ) {
	debug( '/upgrades/{planId}/cancel-plan-trial' );

	return this.wpcom.req.post(
		{
			path: `/upgrades/${ planId }/cancel-plan-trial`,
		},
		fn
	);
};

/**
 * Get the Directly configuration for the current user
 *
 * @param {Function} fn The callback function
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.getDirectlyConfiguration = function( fn ) {
	return this.wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/help/directly/mine',
		},
		fn
	);
};

Undocumented.prototype.submitKayakoTicket = function( subject, message, locale, client, fn ) {
	debug( 'submitKayakoTicket' );

	return this.wpcom.req.post(
		{
			path: '/help/tickets/kayako/new',
			body: { subject, message, locale, client },
		},
		fn
	);
};

Undocumented.prototype.getKayakoConfiguration = function( fn ) {
	return this.wpcom.req.get(
		{
			path: '/help/tickets/kayako/mine',
		},
		fn
	);
};

/**
 * Get the olark configuration for the current user
 *
 * @param {Object} client - current user
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getOlarkConfiguration = function( client, fn ) {
	return this.wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/help/olark/mine',
			body: { client },
		},
		fn
	);
};

Undocumented.prototype.submitSupportForumsTopic = function( subject, message, locale, client, fn ) {
	return this.wpcom.req.post(
		{
			path: '/help/forums/support/topics/new',
			body: { subject, message, locale, client },
		},
		fn
	);
};

/**
 * Get the available export configuration settings for a site
 *
 * @param {int}       siteId            The site ID
 * @param {Function}  fn                The callback function
 * @returns {Promise} A promise that resolves when the request completes
 * @api public
 */
Undocumented.prototype.getExportSettings = function( siteId, fn ) {
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
 * @param {int}       siteId            The site ID
 * @param {Object}    advancedSettings  Advanced export configuration
 * @param {Function}  fn                The callback function
 * @returns {Promise}                   A promise that resolves when the export started
 */
Undocumented.prototype.startExport = function( siteId, advancedSettings, fn ) {
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
 * @param {Number|String} siteId - The site ID
 * @param {Object} exportId - Export ID (for future use)
 * @param {Function} fn - The callback function
 * @returns {Promise}  promise
 */
Undocumented.prototype.getExport = function( siteId, exportId, fn ) {
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
 * @return {Promise} promise  Request promise
 */
Undocumented.prototype.getSiteConnectInfo = function( inputUrl ) {
	return this.wpcom.req.get( '/connect/site-info', { url: inputUrl } );
};

/**
 * Exports the user's Reader feed as an OPML XML file.
 * A JSON object is returned with the XML given as a String
 * in the `opml` field.
 *
 * @param  {Function} fn      The callback function
 * @return {Promise}  promise
 */
Undocumented.prototype.exportReaderFeed = function( fn ) {
	debug( '/read/following/mine/export' );
	const query = {
		apiVersion: '1.2',
	};
	return this.wpcom.req.get( '/read/following/mine/export', query, fn );
};

/**
 * Imports given XML file into the user's Reader feed.
 * XML file is expected to be in OPML format.
 *
 * @param {File}     file         The File object to upload
 * @param {Function} fn           The callback function
 * @returns {XMLHttpRequest} The XHR instance, to attach `progress`
 *   listeners to, etc.
 */
Undocumented.prototype.importReaderFeed = function( file, fn ) {
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
 * @param {String}     registration   The registration to be stored
 * @param {String}     deviceFamily   The device family
 * @param {String}     deviceName     The device name
 * @param {Function}   fn             The callback function
 * @returns {XMLHttpRequest}          The XHR instance
 */
Undocumented.prototype.registerDevice = function( registration, deviceFamily, deviceName, fn ) {
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
 * @param {int}        deviceId       The device ID for the registration to be removed
 * @param {Function}   fn             The callback function
 * @returns {XMLHttpRequest}          The XHR instance
 */
Undocumented.prototype.unregisterDevice = function( deviceId, fn ) {
	debug( '/devices/:device_id/delete' );
	return this.wpcom.req.post( { path: `/devices/${ deviceId }/delete` }, fn );
};

/**
 * Requests streamlined approval to WordAds program
 *
 * @param {int}       siteId            The site ID
 * @returns {Promise}
 */
Undocumented.prototype.wordAdsApprove = function( siteId ) {
	debug( '/sites/:site:/wordads/approve' );
	return this.wpcom.req.post( '/sites/' + siteId + '/wordads/approve' );
};

/**
 * Initiate the Automated Transfer process, uploading a theme and/or selecting
 * a community plugin.
 *
 * @param {int} siteId -- the ID of the site
 * @param {string} [plugin] -- .org plugin slug
 * @param {File} [theme] -- theme zip to upload
 * @param {Function} [onProgress] -- called with upload progress status
 *
 * @returns {Promise} promise for handling result
 */
Undocumented.prototype.initiateTransfer = function( siteId, plugin, theme, onProgress ) {
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
 * Returns a list of media from an external media service. Similar to Site.mediaList in use, but
 * with a more restricted set of query params.
 *
 * @param {Object} query - Media query, supports 'path', 'search', 'max', 'page_handle', and 'source'
 * @param {Function} fn - The callback function
 *
 * @returns {Promise} promise for handling result
 */
Undocumented.prototype.externalMediaList = function( query, fn ) {
	debug( `/meta/external-media/${ query.source }` );

	return this.wpcom.req.get( `/meta/external-media/${ query.source }`, query, fn );
};

/**
 * Fetch the status of an Automated Transfer.
 *
 * @param {int} siteId -- the ID of the site being transferred
 * @param {int} transferId -- ID of the specific transfer
 *
 * @returns {Promise} promise for handling result
 */
Undocumented.prototype.transferStatus = function( siteId, transferId ) {
	debug( '/sites/:site_id/automated-transfers/status/:transfer_id' );
	return this.wpcom.req.get( {
		path: `/sites/${ siteId }/automated-transfers/status/${ transferId }`,
	} );
};

/**
 * Submit a response to the NPS Survey.
 * @param {string}     surveyName     The name of the NPS survey being submitted
 * @param {int}        score          The value for the survey response
 * @param {Function}   fn             The callback function
 * @returns {Promise}
 */
Undocumented.prototype.submitNPSSurvey = function( surveyName, score, fn ) {
	return this.wpcom.req.post(
		{ path: `/nps/${ surveyName }` },
		{ apiVersion: '1.2' },
		{ score },
		fn
	);
};

/**
 * Dismiss the NPS Survey.
 * @param {string}     surveyName     The name of the NPS survey being submitted
 * @param {Function}   fn             The callback function
 * @returns {Promise}
 */
Undocumented.prototype.dismissNPSSurvey = function( surveyName, fn ) {
	return this.wpcom.req.post(
		{ path: `/nps/${ surveyName }` },
		{ apiVersion: '1.2' },
		{ dismissed: true },
		fn
	);
};

/**
 * Check the eligibility status for the NPS Survey.
 * @param {Function}   fn             The callback function
 * @returns {Promise}
 */
Undocumented.prototype.checkNPSSurveyEligibility = function( fn ) {
	return this.wpcom.req.get( { path: '/nps' }, { apiVersion: '1.2' }, {}, fn );
};

/**
 * Send the optional feedback for the NPS Survey.
 * @param {string}   surveyName   The name of the NPS survey being submitted
 * @param {string}   feedback     The content
 * @param {Function} fn           The callback function
 * @returns {Promise} A promise
 */
Undocumented.prototype.sendNPSSurveyFeedback = function( surveyName, feedback, fn ) {
	return this.wpcom.req.post(
		{ path: `/nps/${ surveyName }` },
		{ apiVersion: '1.2' },
		{ feedback },
		fn
	);
};

/**
 * Get OAuth2 Client data for a given client ID
 * @param {string}     clientId       The client ID
 * @param {Function}   fn             The callback function
 * @returns {Promise}  A promise
 */
Undocumented.prototype.oauth2ClientId = function( clientId, fn ) {
	return this.wpcom.req.get(
		`/oauth2/client-data/${ clientId }`,
		{ apiNamespace: 'wpcom/v2' },
		fn
	);
};

/**
 * Fetch the curated list of featured plugins.
 * @param {Function}   fn             The callback function
 * @returns {Promise}  A promise
 */
Undocumented.prototype.getFeaturedPlugins = function( fn ) {
	return this.wpcom.req.get( '/plugins/featured', { apiNamespace: 'wpcom/v2' }, fn );
};

/**
 * Fetch a nonce to use in the `updateSiteAddress` call
 * @param {int}   siteId  The ID of the site for which to get a nonce.
 * @returns {Promise}     A promise
 */
Undocumented.prototype.getRequestSiteAddressChangeNonce = function( siteId ) {
	return this.wpcom.req.get( {
		path: `/sites/${ siteId }/site-address-change/nonce`,
		apiNamespace: 'wpcom/v2',
	} );
};

/**
 * Request server-side validation (including an availibility check) of the given site address.
 *
 * @param {int} [siteId] The siteId for which to validate
 * @param {object} [siteAddress]	The site address to validate
 * @param {string} [domain] The domain name of the new site address (ex. news.blog, wordpress.com, etc.)
 * @param {string} [type] blog/dotblog - blog for wordpress.com, dotblog for .blog domains
 * @returns {Promise}  A promise
 */
Undocumented.prototype.checkSiteAddressValidation = function( siteId, siteAddress, domain, type ) {
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
 * @param {int} [siteId] The siteId for which to change the address
 * @param {object} [blogname]	The desired new site address
 * @param {string} [domain] The domain name of the new site address (ex. news.blog, wordpress.com, etc.)
 * @param {string} [oldDomain] The full domain name of the original site (ex. mysite.news.blog, mysite.wordpress.com, etc.)
 * @param {string} [type] blog/dotblog - blog for wordpress.com->wordpress.com, dotblog if the old and/or new domain is .blog
 * @param {bool} [discard]			Should the old site address name be discarded?
 * @param {string} [nonce]		A nonce provided by the API
 * @returns {Promise}  A promise
 */
Undocumented.prototype.updateSiteAddress = function(
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

Undocumented.prototype.requestGdprConsentManagementLink = function( domain, callback ) {
	return this.wpcom.req.get( `/domains/${ domain }/request-gdpr-consent-management-link`, function(
		error,
		response
	) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.getDomainConnectSyncUxUrl = function(
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

Undocumented.prototype.applePayMerchantValidation = function( validationURL, environment ) {
	const queries = { validation_url: validationURL };

	if ( environment ) {
		queries.environment = environment;
	}

	return this.wpcom.req.get( '/apple-pay/merchant-validation/', queries );
};

export default Undocumented;
