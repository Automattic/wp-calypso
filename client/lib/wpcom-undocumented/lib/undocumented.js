/**
 * External dependencies.
 */
var debug = require( 'debug' )( 'calypso:wpcom-undocumented:undocumented' ),
	isPlainObject = require( 'lodash/isPlainObject' ),
	clone = require( 'lodash/clone' ),
	omit = require( 'lodash/omit' ),
	camelCase = require( 'lodash/camelCase' ),
	snakeCase = require( 'lodash/snakeCase' ),
	pick = require( 'lodash/pick' ),
	url = require( 'url' ),
	reject = require( 'lodash/reject' );

/**
 * Internal dependencies.
 */
var Site = require( './site' ),
	Me = require( './me' ),
	MailingList = require( './mailing-list' ),
	config = require( 'config' ),
	i18n = require( 'lib/i18n-utils' );

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
 * Jetpack modules data from the site with id siteId
 *
 * @param {int} [siteId]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.jetpackModules = function( siteId, fn ) {
	debug( '/sites/:site_id:/jetpack/modules/ query' );
	this.wpcom.req.get( '/sites/' + siteId + '/jetpack/modules', fn );
};

/*
 * Activate the Jetpack module with moduleSlug on the site with id siteId
 *
 * @param {int} [siteId]
 * @param {string} [moduleSlug]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.jetpackModulesActivate = function( siteId, moduleSlug, fn ) {
	debug( '/sites/:site_id:/jetpack/modules/:module_slug query' );
	this.wpcom.req.post( { path: '/sites/' + siteId + '/jetpack/modules/' + moduleSlug }, {}, { active: true }, fn );
};

/*
 * Deactivate the Jetpack module with moduleSlug on the site with id siteId
 *
 * @param {int} [siteId]
 * @param {string} [moduleSlug]
 * @param {Function} fn
 * @api public
 */
Undocumented.prototype.jetpackModulesDeactivate = function( siteId, moduleSlug, fn ) {
	debug( '/sites/:site_id:/jetpack/modules/:module_slug query' );
	this.wpcom.req.post( { path: '/sites/' + siteId + '/jetpack/modules/' + moduleSlug }, {}, { active: false }, fn );
};

/**
 * Update WordPress core install on the site with id siteId
 *
 * @param {int} [siteId] The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.updateWordPressCore = function( siteId, fn ) {
	debug( '/sites/:site_id:/core/update query' );
	this.wpcom.req.post( { path: '/sites/' + siteId + '/core/update' }, fn );
};

/**
 * Get the updates info for the site with id siteId
 *
 * @param {int} [siteId] The site ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getAvailableUpdates = function( siteId, fn ) {
	debug( '/sites/:site_id:/updates query' );
	this.wpcom.req.get( { path: '/sites/' + siteId + '/updates' }, fn );
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
	this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId }, fn );
};

Undocumented.prototype.updateMonitorSettings = function( siteId, emailNotifications, fn ) {
	debug( '/jetpack-blogs/:site_id: query' );
	this.wpcom.req.post( { path: '/jetpack-blogs/' + siteId }, {}, { email_notifications: emailNotifications }, fn );
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
	this.wpcom.req.post( { path: '/jetpack-blogs/' + siteId + '/mine/delete' }, fn );
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
	this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId + '/keys' }, fn );
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
	this.wpcom.req.get( { path: '/jetpack-blogs/' + siteId + '/test-connection' }, fn );
};

Undocumented.prototype.jetpackLogin = function( siteId, _wp_nonce, redirect_uri, scope, state ) {
	debug( '/jetpack-blogs/:site_id:/jetpack-login query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/jetpack-login';
	const params = { _wp_nonce, redirect_uri, scope, state };
	return this.wpcom.req.get( { path: endpointUrl }, params );
};

Undocumented.prototype.jetpackAuthorize = function( siteId, code, state, redirect_uri, secret ) {
	debug( '/jetpack-blogs/:site_id:/authorize query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/authorize';
	const params = { code, state, redirect_uri, secret };
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

Undocumented.prototype.activateManage = function( siteId, state, secret ) {
	debug( '/jetpack-blogs/:site_id:/activate-manage query' );
	const endpointUrl = '/jetpack-blogs/' + siteId + '/activate-manage';
	const params = { state, secret };
	return this.wpcom.req.post( { path: endpointUrl }, params );
};

Undocumented.prototype.invitesList = function( siteId, number, offset, fn ) {
	debug( '/sites/:site_id:/invites query' );
	this.wpcom.req.get( '/sites/' + siteId + '/invites', {
		number: number,
		offset: offset
	}, fn );
};

Undocumented.prototype.getInvite = function( siteId, inviteKey, fn ) {
	debug( '/sites/:site_id:/invites/:inviteKey:/ query' );
	this.wpcom.req.get( { path: '/sites/' + siteId + '/invites/' + inviteKey }, fn );
};

Undocumented.prototype.acceptInvite = function( invite, fn ) {
	debug( '/sites/:site_id:/invites/:inviteKey:/accept query' );
	this.wpcom.req.get( '/sites/' + invite.site.ID + '/invites/' + invite.inviteKey + '/accept', {
		activate: invite.activationKey
	}, fn );
};

Undocumented.prototype.sendInvites = function( siteId, usernamesOrEmails, role, message, fn ) {
	debug( '/sites/:site_id:/invites/new query' );
	this.wpcom.req.post( '/sites/' + siteId + '/invites/new', {}, {
		invitees: usernamesOrEmails,
		role: role,
		message: message
	}, fn );
};

Undocumented.prototype.createInviteValidation = function( siteId, usernamesOrEmails, role, fn ) {
	debug( '/sites/:site_id:/invites/validate query' );
	this.wpcom.req.post( '/sites/' + siteId + '/invites/validate', {}, {
		invitees: usernamesOrEmails,
		role: role
	}, fn );
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
Undocumented.prototype.settings = function( siteId, method, data, fn ) {
	debug( '/sites/:site_id:/settings query' );
	if ( 'function' === typeof method ) {
		fn = method;
		method = 'get';
		data = {};
	}

	this.wpcom.req[ method ]( {
		path: '/sites/' + siteId + '/settings',
		body: data
	}, fn );
};

Undocumented.prototype._sendRequestWithLocale = function( originalParams, fn ) {
	const { apiVersion, body = {}, method } = originalParams,
		locale = i18n.getLocaleSlug(),
		updatedParams = omit( originalParams, [ 'apiVersion', 'method' ] );

	updatedParams.body = Object.assign( {}, body, { locale } );

	if ( apiVersion ) {
		// TODO: temporary solution for apiVersion until https://github.com/Automattic/wpcom.js/issues/152 is resolved
		return this.wpcom.req[ method.toLowerCase() ]( updatedParams, { apiVersion }, fn );
	}

	return this.wpcom.req[ method.toLowerCase() ]( updatedParams, fn );
};

/**
 * Determine whether a domain name can be mapped
 *
 * @param {string} domain - The domain name to check.
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.isDomainMappable = function( domain, fn ) {
	domain = encodeURIComponent( domain );

	this.wpcom.req.get( { path: '/domains/' + domain + '/is-mappable' }, fn );
};

/**
 * Determine whether a domain name is available for registration
 *
 * @param {string} domain - The domain name to check.
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.isDomainAvailable = function( domain, fn ) {
	domain = encodeURIComponent( domain );

	this.wpcom.req.get( { path: '/domains/' + domain + '/is-available' }, fn );
};

/**
 * Determine whether a domain name can be used for Site Redirect
 *
 * @param {int|string} siteId The site ID
 * @param {string} domain The domain name to check
 * @param {function} fn The callback function
 * @api public
 */
Undocumented.prototype.canRedirect = function( siteId, domain, fn ) {
	domain = encodeURIComponent( domain );

	this.wpcom.req.get( { path: '/domains/' + siteId + '/' + domain + '/can-redirect' }, fn );
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

	this.wpcom.req.get( { path: '/sites/' + siteId + '/domains/redirect' }, fn );
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

	this.wpcom.req.post( { path: '/sites/' + siteId + '/domains/redirect' }, { location }, fn );
};

/**
 * Retrieves the domain contact information of the user.
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getDomainContactInformation = function( fn ) {
	debug( '/me/domain-contact-information query' );

	this._sendRequestWithLocale( {
		path: '/me/domain-contact-information',
		method: 'get'
	}, function( error, data ) {
		var newData;

		if ( error ) {
			return fn( error );
		}

		newData = mapKeysRecursively( data, function( key ) {
			return ( key === '_headers' ) ? key : camelCase( key );
		} );

		fn( null, newData );
	} );
};

Undocumented.prototype.getDomainRegistrationSupportedStates = function( countryCode, fn ) {
	debug( '/domains/supported-states/ query' );

	this._sendRequestWithLocale( {
		path: '/domains/supported-states/' + countryCode,
		method: 'get'
	}, fn );
};

Undocumented.prototype.getDomainRegistrationSupportedCountries = function( fn ) {
	debug( '/domains/supported-countries/ query' );

	this._sendRequestWithLocale( {
		path: '/domains/supported-countries/',
		method: 'get'
	}, fn );
};

Undocumented.prototype.getPaymentSupportedCountries = function( fn ) {
	debug( '/me/transactions/supported-countries/ query' );

	this._sendRequestWithLocale( {
		path: '/me/transactions/supported-countries/',
		method: 'get'
	}, fn );
};

Undocumented.prototype.getSmsSupportedCountries = function( fn ) {
	debug( 'meta/sms-supported-countries/ query' );

	this.wpcom.req.get( { path: '/meta/sms-country-codes/' }, fn );
};

function mapKeysRecursively( object, fn ) {
	return Object.keys( object ).reduce( function( mapped, key ) {
		var value = object[ key ];
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
Undocumented.prototype.validateDomainContactInformation = function( contactInformation, domainNames, fn ) {
	var data = {
		contactInformation: contactInformation,
		domainNames: domainNames
	};

	debug( '/me/domain-contact-information/validate query' );
	data = mapKeysRecursively( data, snakeCase );

	this.wpcom.req.post(
		{ path: '/me/domain-contact-information/validate' },
		data, function( error, successData ) {
			var newData;

			if ( error ) {
				return fn( error );
			}

			newData = mapKeysRecursively( successData, function( key ) {
				return ( key === '_headers' ) ? key : camelCase( key );
			} );

			fn( null, newData );
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
	return this._sendRequestWithLocale( {
		path: '/products',
		method: 'get'
	}, fn );
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

	this._sendRequestWithLocale( {
		path: '/sites/' + siteDomain + '/plans',
		method: 'get'
	}, fn );
};

/**
 * GET/POST cart
 *
 * @param {string} [siteDomain] The site's slug
 * @param {string} [method] The request method
 * @param {object} [data] The REQUEST data
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.cart = function( siteDomain, method, data, fn ) {
	debug( '/sites/:site_id:/shopping-cart query' );
	if ( arguments.length === 2 ) {
		fn = method;
		method = 'GET';
		data = {};
	} else if ( arguments.length === 3 ) {
		fn = data;
		method = 'GET';
		data = {};
	}
	this._sendRequestWithLocale( {
		path: '/sites/' + siteDomain + '/shopping-cart',
		method: method,
		body: data
	}, fn );
};

/**
 * Get a list of the user's stored cards
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getStoredCards = function( fn ) {
	debug( '/me/stored-cards query' );
	this.wpcom.req.get( { path: '/me/stored-cards' }, fn );
};

/**
 * GET site menus
 *
 * @param {int|string} [siteId] The site ID
 * @param {Function} [callback] The callback function called with arguments error, data
 * @api public
 */
Undocumented.prototype.menus = function( siteId, callback ) {
	debug( '/sites/:site_id/menus query' );

	this.wpcom.req.get( { path: '/sites/' + siteId + '/menus' }, callback );
};

/**
 * Update site menus
 *
 * @param {int|string} siteId the ID of the site.
 * @param {int|string} menuId use 0 to create a new menu
 * @param {object} [data] menus & locations data
 * @param {Function} [callback] called with arguments error, data
 * @api public
 */
Undocumented.prototype.menusUpdate = function( siteId, menuId, data, callback ) {
	debug( '/sites/:site_id/menus/:menu_id query' );

	if ( menuId === 0 ) {
		menuId = 'new';
	}

	this.wpcom.req.post( { path: '/sites/' + siteId + '/menus/' + menuId }, data, callback );
};

/**
 * Delete a navigation menu
 *
 * @param {int|string} siteId The site ID
 * @param {int|string} menuId The menu ID
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.menusDelete = function( siteId, menuId, fn ) {
	debug( '/sites/:site_id/menus/:menu_id/delete query' );

	this.wpcom.req.post( { path: '/sites/' + siteId + '/menus/' + menuId + '/delete' }, fn );
};

/**
 * Return a list of third-party services that WordPress.com can integrate with
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.metaKeyring = function( fn ) {
	debug( '/meta/external-services query' );
	this.wpcom.req.get( {
		path: '/meta/external-services/',
		apiVersion: '1.1'
	}, fn );
};

/**
 * Return a list of happiness engineers gravatar urls
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getHappinessEngineers = function( fn ) {
	debug( 'meta/happiness-engineers/ query' );

	this.wpcom.req.get( { path: '/meta/happiness-engineers/' }, fn );
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
	this.wpcom.req.get( '/sites/' + siteId + '/sharing-buttons', query, fn );
};

/**
 * Return a single sharing buttons for the specified site
 *
 * @param {int|string} siteId The site ID or domain
 * @param {string} buttonId The sharing button ID
 * @param {Function} fn Method to invoke when request is complete
 * @api public
 */
Undocumented.prototype.sharingButton = function( siteId, buttonId, fn ) {
	debug( '/sites/:site_id:/sharing-buttons query' );
	this.wpcom.req.get( { path: '/sites/' + siteId + '/sharing-buttons/' + buttonId }, fn );
};

/**
 * Saves a single sharing buttons for the specified site
 *
 * @param {int|string} siteId The site ID or domain
 * @param {Object} button The sharing button object
 * @param {Function} fn Method to invoke when request is complete
 * @api public
 */
Undocumented.prototype.saveSharingButton = function( siteId, button, fn ) {
	debug( '/sites/:site_id:/sharing-buttons query' );
	this.wpcom.req.post( {
		path: '/sites/' + siteId + '/sharing-buttons/' + button.ID,
		body: button,
		apiVersion: '1.1'
	}, fn );
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
	this.wpcom.req.post( {
		path: '/sites/' + siteId + '/sharing-buttons',
		body: { sharing_buttons: buttons },
		apiVersion: '1.1'
	}, fn );
};

/**
 * Return a list of user's connected services
 *
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.mekeyringConnections = function( fn ) {
	debug( '/me/keyring-connections query' );
	this.wpcom.req.get( {
		path: '/me/keyring-connections',
		apiVersion: '1.1'
	}, fn );
};

/**
 * Deletes a single keyring connection for the current user
 *
 * @param {int} keyringConnectionId The keyring connection ID to remove
 * @param {Function} fn Method to invoke when request is complete
 */
Undocumented.prototype.deletekeyringConnection = function( keyringConnectionId, fn ) {
	debug( '/me/keyring-connections/:keyring_connection_id:/delete query' );
	this.wpcom.req.post( {
		path: '/me/keyring-connections/' + keyringConnectionId + '/delete',
		apiVersion: '1.1'
	}, fn );
};

/**
 * Return a list of user's connected publicize services for the given site
 *
 * @param {int|string} siteId The site ID or domain
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.siteConnections = function( siteId, fn ) {
	debug( '/sites/:site_id:/publicize-connections query' );
	this.wpcom.req.get( {
		path: '/sites/' + siteId + '/publicize-connections',
		apiVersion: '1.1'
	}, fn );
};

/**
 * Deletes a single site connection
 *
 * @param {int|string} siteId The site ID or domain
 * @param {int} connectionId The connection ID to remove
 * @param {Function} fn Method to invoke when request is complete
 */
Undocumented.prototype.deleteSiteConnection = function( siteId, connectionId, fn ) {
	debug( '/sites/:site_id:/publicize-connections/:connection_id:/delete query' );
	this.wpcom.req.post( {
		path: '/sites/' + siteId + '/publicize-connections/' + connectionId + '/delete',
		apiVersion: '1.1'
	}, fn );
};

/**
 * Delete a site
 *
 * @param  {int|string} siteId The site ID or domain
 * @param  {Function} fn Function to invoke when request is complete
 */
Undocumented.prototype.deleteSite = function( siteId, fn ) {
	debug( '/sites/:site_id/delete query' );
	this.wpcom.req.post( { path: '/sites/' + siteId + '/delete' }, fn );
};

/**
 * Creates a single connection using the specified Keyring connection ID and an
 *  optional `options` object, which can include a `shared` property
 *
 * @param {int} keyringConnectionId The Keyring connection ID to use
 * @param {int|string} siteId The site ID or domain
 * @param {string} externalUserId User ID if not connecting to primary account
 * @param {object} options Optional options
 * @param {Function} fn Method to invoke when request is complete
 */
Undocumented.prototype.createConnection = function( keyringConnectionId, siteId, externalUserId, options, fn ) {
	var body, path;

	// Method overloading: Optional `options`
	if ( 'undefined' === typeof fn && 'function' === typeof options ) {
		fn = options;
		options = {};
	}

	// Build request body
	body = { keyring_connection_ID: keyringConnectionId };
	if ( 'boolean' === typeof options.shared ) {
		body.shared = options.shared;
	}

	if ( externalUserId ) {
		body.external_user_ID = externalUserId;
	}

	path = siteId
		? '/sites/' + siteId + '/publicize-connections/new'
		: '/me/publicize-connections/new';

	this.wpcom.req.post( { path, body, apiVersion: '1.1' }, fn );
};

/**
 * Updates a single publicize connection
 *
 * @param {int|string} siteId An optional site ID or domain
 * @param {int} connectionId The connection ID to update
 * @param {object} data The update request body
 * @param {Function} fn Function to invoke when request is complete
 */
Undocumented.prototype.updateConnection = function( siteId, connectionId, data, fn ) {
	var path;

	if ( siteId ) {
		debug( '/sites/:site_id:/publicize-connections/:connection_id: query' );
		path = '/sites/' + siteId + '/publicize-connections/' + connectionId;
	} else {
		debug( '/me/publicize-connections/:connection_id: query' );
		path = '/me/publicize-connections/' + connectionId;
	}

	this.wpcom.req.post( {
		path: path,
		body: data,
		apiVersion: '1.1'
	}, fn );
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
 *		payment_key: {string} Either the Paygate key or the mp_ref from /me/stored_cards,
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

	this._sendRequestWithLocale( {
		path: '/me/transactions',
		method: method,
		body: data
	}, fn );
};

Undocumented.prototype.updateCreditCard = function( params, fn ) {
	const data = pick( params, [ 'country', 'zip', 'month', 'year', 'name' ] );
	data.paygate_token = params.paygateToken;

	this.wpcom.req.post( '/upgrades/' + params.purchaseId + '/update-credit-card', data, fn );
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

	this.wpcom.req.get( '/me/paygate-configuration', query, fn );
};

/**
 * GET paypal_express_url
 *
 * @param {object} [data] The GET data
 * @param {Function} fn The callback function
 * @api public
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

	this.wpcom.req.post( '/me/paypal-express-url', data, fn );
};

/**
 * GET example domain suggestions
 *
 * @param {Function} fn - The callback funtion
 * @api public
 */
Undocumented.prototype.exampleDomainSuggestions = function( fn ) {
	this.wpcom.req.get( { path: '/domains/suggestions/examples' }, function( error, response ) {
		if ( error ) {
			return fn( error );
		}

		fn( null, response );
	} );
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
	this.wpcom.req.post( '/sites/' + siteId + '/domains/primary', {}, { domain: domain }, fn );
};

/**
 * Fetch preview markup for a site
 *
 * @param {int} siteId The site ID
 * @param {string} path Optional. The site path to preview
 * @param {object} postData Optional. The customization data to send
 * @return {Promise} A Promise to resolve when complete
 */
Undocumented.prototype.fetchPreviewMarkup = function( siteId, path, postData ) {
	debug( '/sites/:site_id/previews/mine' );
	return new Promise( ( resolve, reject ) => {
		const endpoint = `/sites/${siteId}/previews/mine`;
		const query = { path };
		const isPreviewCustomized = ( postData && Object.keys( postData ).length > 0 );
		const request = isPreviewCustomized ? this.wpcom.req.post( endpoint, query, { customized: postData } ) : this.wpcom.req.get( endpoint, query );
		request
			.then( response => {
				if ( ! response.html ) {
					return reject( new Error( 'No markup received from API' ) );
				}
				resolve( response.html );
			} )
			.catch( reject );
	} );
};

Undocumented.prototype.readFollowing = function( query, fn ) {
	debug( '/read/following' );
	query.apiVersion = '1.3';
	this.wpcom.req.get( '/read/following', query, fn );
};

Undocumented.prototype.readFollowingMine = function( query, fn ) {
	debug( '/read/following/mine' );
	query.apiVersion = '1.2';
	this.wpcom.req.get( '/read/following/mine', query, fn );
};

Undocumented.prototype.readA8C = function( query, fn ) {
	debug( '/read/a8c' );
	query.apiVersion = '1.3';
	this.wpcom.req.get( '/read/a8c', query, fn );
};

Undocumented.prototype.readFeed = function( query, fn ) {
	var params = omit( query, 'ID' );
	debug( '/read/feed' );
	return this.wpcom.req.get( '/read/feed/' + encodeURIComponent( query.ID ), params, fn );
};

Undocumented.prototype.discoverFeed = function( query, fn ) {
	debug( '/read/feed' );
	return this.wpcom.req.get( '/read/feed/', query, fn );
};

Undocumented.prototype.readFeedPosts = function( query, fn ) {
	var params = omit( query, 'ID' );
	debug( '/read/feed/' + query.ID + '/posts' );
	params.apiVersion = '1.3';

	this.wpcom.req.get( '/read/feed/' + encodeURIComponent( query.ID ) + '/posts', params, fn );
};

Undocumented.prototype.readFeedPost = function( query, fn ) {
	var params = omit( query, [ 'feedId', 'postId' ] );
	debug( '/read/feed/' + query.feedId + '/posts/' + query.postId );
	params.apiVersion = '1.3';

	return this.wpcom.req.get( '/read/feed/' + encodeURIComponent( query.feedId ) + '/posts/' + encodeURIComponent( query.postId ), params, fn );
};

Undocumented.prototype.readSearch = function( query, fn ) {
	debug( '/read/search', query );
	const params = Object.assign( { apiVersion: '1.2' }, query );
	this.wpcom.req.get( '/read/search', params, fn );
};

Undocumented.prototype.readTag = function( query, fn ) {
	var params = omit( query, 'slug' );
	debug( '/read/tag/' + query.slug );
	this.wpcom.req.get( '/read/tags/' + query.slug, params, fn );
};

Undocumented.prototype.readTags = function( fn ) {
	debug( '/read/tags' );
	this.wpcom.req.get( '/read/tags', fn );
};

Undocumented.prototype.readTagPosts = function( query, fn ) {
	var params = omit( query, 'tag' );
	debug( '/read/tags/' + query.tag + '/posts' );
	if ( config.isEnabled( 'reader/tags-with-elasticsearch' ) ) {
		params.apiVersion = '1.3';
	} else {
		params.apiVersion = '1.2';
	}

	this.wpcom.req.get( '/read/tags/' + encodeURIComponent( query.tag ) + '/posts', params, fn );
};

Undocumented.prototype.readRecommendedPosts = function( query, fn ) {
	debug( '/recommendations/posts' );
	query.apiVersion = '1.2';
	this.wpcom.req.get( '/read/recommendations/posts', query, fn );
};

Undocumented.prototype.followReaderTag = function( tag, fn ) {
	debug( '/read/tags/' + tag + '/mine/new' );
	this.wpcom.req.post( '/read/tags/' + tag + '/mine/new', fn );
};

Undocumented.prototype.unfollowReaderTag = function( tag, fn ) {
	debug( '/read/tags/' + tag + '/mine/delete' );
	this.wpcom.req.post( '/read/tags/' + tag + '/mine/delete', fn );
};

Undocumented.prototype.readLiked = function( query, fn ) {
	var params = clone( query );
	debug( '/read/liked' );
	params.apiVersion = '1.2';
	this.wpcom.req.get( '/read/liked', params, fn );
};

Undocumented.prototype.readList = function( query, fn ) {
	var params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/list' );
	params.apiVersion = '1.2';
	this.wpcom.req.get( '/read/lists/' + query.owner + '/' + query.slug, params, fn );
};

Undocumented.prototype.readListPosts = function( query, fn ) {
	var params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/list/:list/posts' );
	params.apiVersion = '1.2';
	this.wpcom.req.get( '/read/list/' + query.owner + '/' + query.slug + '/posts', params, fn );
};

Undocumented.prototype.readLists = function( fn ) {
	debug( '/read/lists' );
	this.wpcom.req.get( '/read/lists', { apiVersion: '1.2' }, fn );
};

Undocumented.prototype.readListsNew = function( title, fn ) {
	debug( '/read/lists/new' );
	this.wpcom.req.post( '/read/lists/new', { apiVersion: '1.2' }, { title: title }, fn );
};

Undocumented.prototype.readListsUpdate = function( query, fn ) {
	var params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:list/update' );
	this.wpcom.req.post(
		'/read/lists/' + encodeURIComponent( query.owner ) + '/' + encodeURIComponent( query.slug ) + '/update',
		{ apiVersion: '1.2' },
		params,
		fn
	);
};

Undocumented.prototype.followList = function( query, fn ) {
	var params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:owner/:slug/follow' );
	this.wpcom.req.post(
		'/read/lists/' + encodeURIComponent( query.owner ) + '/' + encodeURIComponent( query.slug ) + '/follow',
		{ apiVersion: '1.2' },
		params,
		fn
	);
};

Undocumented.prototype.unfollowList = function( query, fn ) {
	var params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:owner/:slug/unfollow' );
	this.wpcom.req.post(
		'/read/lists/' + encodeURIComponent( query.owner ) + '/' + encodeURIComponent( query.slug ) + '/unfollow',
		{ apiVersion: '1.2' },
		params,
		fn
	);
};

Undocumented.prototype.readListTags = function( query, fn ) {
	var params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:owner/:list/tags' );
	params.apiVersion = '1.2';
	this.wpcom.req.get( '/read/lists/' + encodeURIComponent( query.owner ) + '/' + encodeURIComponent( query.slug ) + '/tags', params, fn );
};

Undocumented.prototype.readListItems = function( query, fn ) {
	var params = omit( query, [ 'owner', 'slug' ] );
	debug( '/read/lists/:owner/:list/items' );
	params.apiVersion = '1.2';
	this.wpcom.req.get( '/read/lists/' + encodeURIComponent( query.owner ) + '/' + encodeURIComponent( query.slug ) + '/items', params, fn );
};

Undocumented.prototype.followReaderFeed = function( query, fn ) {
	this.wpcom.req.post( '/read/following/mine/new', query, {}, fn );
};

Undocumented.prototype.unfollowReaderFeed = function( query, fn ) {
	this.wpcom.req.post( '/read/following/mine/delete', query, {}, fn );
};

Undocumented.prototype.readTeams = function( fn ) {
	debug( '/read/teams' );
	this.wpcom.req.get( '/read/teams', { apiVersion: '1.2' }, fn );
};

Undocumented.prototype.readSite = function( query, fn ) {
	var params = omit( query, 'site' );
	debug( '/read/sites/:site' );
	return this.wpcom.req.get( '/read/sites/' + query.site, params, fn );
};

Undocumented.prototype.readSiteFeatured = function( siteId, query, fn ) {
	var params = omit( query, [ 'before', 'after' ] );
	debug( '/read/sites/:site/featured' );
	return this.wpcom.req.get( '/read/sites/' + siteId + '/featured', params, fn );
};

Undocumented.prototype.readSitePosts = function( query, fn ) {
	var params = omit( query, 'site' );
	debug( '/read/sites/:site/posts' );
	return this.wpcom.req.get( '/read/sites/' + query.site + '/posts', params, fn );
};

Undocumented.prototype.readSitePost = function( query, fn ) {
	var params = omit( query, [ 'site', 'postId' ] );
	debug( '/read/sites/:site/post/:post' );
	return this.wpcom.req.get( '/read/sites/' + query.site + '/posts/' + query.postId, params, fn );
};

Undocumented.prototype.readSitePostRelated = function( query, fn ) {
	debug( '/read/site/:site/post/:post/related' );
	const params = omit( query, [ 'site_id', 'post_id' ] );
	params.apiVersion = '1.2';
	return this.wpcom.req.get( '/read/site/' + query.site_id + '/post/' + query.post_id + '/related', params, fn );
};

Undocumented.prototype.fetchSiteRecommendations = function( query, fn ) {
	this.wpcom.req.get( '/read/recommendations/mine', query, fn );
};

Undocumented.prototype.readRecommendationsStart = function( query, fn ) {
	return this.wpcom.req.get( '/read/recommendations/start', query, fn );
};

Undocumented.prototype.graduateNewReader = function( fn ) {
	const params = { apiVersion: '1.2' };
	return this.wpcom.req.post( '/read/graduate-new-reader', params, {}, fn );
};

Undocumented.prototype.readNewPostEmailSubscription = function( query, fn ) {
	var params = omit( query, [ 'site' ] );
	debug( '/read/site/:site/post_email_subscriptions/new' );
	this.wpcom.req.post( '/read/site/' + encodeURIComponent( query.site ) + '/post_email_subscriptions/new', { apiVersion: '1.2' }, params, fn );
};

Undocumented.prototype.readUpdatePostEmailSubscription = function( query, fn ) {
	var params = omit( query, [ 'site' ] );
	debug( '/read/site/:site/post_email_subscriptions/update' );
	this.wpcom.req.post( '/read/site/' + encodeURIComponent( query.site ) + '/post_email_subscriptions/update', { apiVersion: '1.2' }, params, fn );
};

Undocumented.prototype.readDeletePostEmailSubscription = function( query, fn ) {
	var params = omit( query, [ 'site' ] );
	debug( '/read/site/:site/post_email_subscriptions/delete' );
	this.wpcom.req.post( '/read/site/' + encodeURIComponent( query.site ) + '/post_email_subscriptions/delete', { apiVersion: '1.2' }, params, fn );
};

Undocumented.prototype.readNewCommentEmailSubscription = function( query, fn ) {
	var params = omit( query, [ 'site' ] );
	debug( '/read/site/:site/comment_email_subscriptions/new' );
	this.wpcom.req.post( '/read/site/' + encodeURIComponent( query.site ) + '/comment_email_subscriptions/new', { apiVersion: '1.2' }, params, fn );
};

Undocumented.prototype.readDeleteCommentEmailSubscription = function( query, fn ) {
	var params = omit( query, [ 'site' ] );
	debug( '/read/site/:site/comment_email_subscriptions/delete' );
	this.wpcom.req.post( '/read/site/' + encodeURIComponent( query.site ) + '/comment_email_subscriptions/delete', { apiVersion: '1.2' }, params, fn );
};

/**
 * Saves a user's A/B test variation on the backend
 *
 * @param {string} name - The name of the A/B test. No leading 'abtest_' needed
 * @param {string} variation - The variation the user is assigned to
 * @param {Function} fn - Function to invoke when request is complete
 * @api public
 */
Undocumented.prototype.saveABTestData = function( name, variation, fn ) {
	var data = {
		name: name,
		variation: variation
	};
	this.wpcom.req.post( {
		path: '/me/abtests',
		body: data
	}, fn );
};

/**
 * Sign up for a new user account
 * Create a new user
 *
 * @param {string} query - an object with three values: email, username, password
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersNew = function( query, fn ) {
	var args;
	debug( '/users/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	// Set the language for the user
	query.locale = i18n.getLocaleSlug();
	args = {
		path: '/users/new',
		body: query
	};
	this.wpcom.req.post( args, fn );
};

/**
 * Sign up for a new phone account
 *
 * @param {string} query - a key/value pair; key: 'phone_number', value: 'the users phone number'
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersPhoneNew = function( query, fn ) {
	var args;
	debug( '/users/phone/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	args = {
		path: '/users/phone/new',
		body: mapKeysRecursively( query, snakeCase )
	};
	this.wpcom.req.post( args, fn );
};

/**
 * Log in to an existing phone account
 *
 * @param {string} query - a key/value pair; key: 'phone_number', value: 'the users phone number'
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersPhone = function( query, fn ) {
	var args;
	debug( '/users/phone' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	args = {
		path: '/users/phone',
		body: mapKeysRecursively( query, snakeCase )
	};
	this.wpcom.req.post( args, fn );
};

/**
 * Verify a record in the signups table and create a new user from it
 *
 * @param {string} query - two key/value pairs; { 'phone_number': 'the users phone number', 'code': 'the verification code we sent to the phone number' }
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersPhoneVerification = function( query, fn ) {
	var args;
	debug( '/users/phone/verification' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	args = {
		path: '/users/phone/verification',
		body: mapKeysRecursively( query, snakeCase )

	};
	this.wpcom.req.post( args, fn );
};

/**
 * Sign up for a new email only account
 *
 * @param {string} query - a key/value pair; key: 'email', value: 'the users email address'
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersEmailNew = function( query, fn ) {
	var args;
	debug( '/users/email/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	args = {
		path: '/users/email/new',
		body: mapKeysRecursively( query, snakeCase )
	};
	this.wpcom.req.post( args, fn );
};

/**
 * Log in to an existing email account
 *
 * @param {string} query - a key/value pair; key: 'email', value: 'the users email address'
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersEmail = function( query, fn ) {
	var args;
	debug( '/users/email' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	args = {
		path: '/users/email',
		body: mapKeysRecursively( query, snakeCase )
	};
	this.wpcom.req.post( args, fn );
};

/**
 * Verify a record in wp_signups and create a new user from it
 *
 * @param {string} query - two key/value pairs; { 'email': 'the users email address', 'code': 'the verification code we sent to the email address' }
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.usersEmailVerification = function( query, fn ) {
	var args;
	debug( '/users/email/verification' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	args = {
		path: '/users/email/verification',
		body: mapKeysRecursively( query, snakeCase )

	};
	this.wpcom.req.post( args, fn );
};

/**
 * Verify user for new signups
 *
 * @param {object} data - object containing an email address, username and password
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.validateNewUser = function( data, fn ) {
	debug( '/signups/validation/user' );

	data.locale = i18n.getLocaleSlug();

	this.wpcom.req.post( '/signups/validation/user/', null, data, fn );
};

/**
 * Create a new site
 *
 * @param {object} query - object containing an site address
 * @param {Function} fn - Function to invoke when request is complete
 */
Undocumented.prototype.sitesNew = function( query, fn ) {
	var localeSlug = i18n.getLocaleSlug();

	debug( '/sites/new' );

	// This API call is restricted to these OAuth keys
	restrictByOauthKeys( query );

	// Set the language for the user
	query.lang_id = i18n.getLanguage( localeSlug ).value;
	query.locale = localeSlug;

	this.wpcom.req.post( {
		path: '/sites/new',
		body: query
	}, fn );
};

/**
 * Fetch the locales relevant to the current user, based on their IP and browser setting
 *
 * @param {Function} fn - Function to invoke when the request is complete
 */
Undocumented.prototype.getLocaleSuggestions = function( fn ) {
	debug( '/locale-guess' );

	this.wpcom.req.get( { path: '/locale-guess' }, fn );
};

Undocumented.prototype.themes = function( site, query, fn ) {
	var path = site ? '/sites/' + site.ID + '/themes' : '/themes';
	debug( path );
	return this.wpcom.req.get( path, {
		search: query.search,
		tier: query.tier,
		filter: query.filter,
		page: query.page,
		number: query.perPage,
		apiVersion: site.jetpack ? '1' : '1.2'
	}, fn );
};

Undocumented.prototype.themeDetails = function( themeId, site, fn ) {
	const sitePath = site ? `/sites/${ site }` : '';
	const path = `${ sitePath }/themes/${ themeId }`;
	debug( path );
	return this.wpcom.req.get( path, {
		apiVersion: '1.2',
	}, fn );
};

Undocumented.prototype.activeTheme = function( siteId, fn ) {
	debug( '/sites/:site_id/themes/mine' );
	return this.wpcom.req.get( { path: '/sites/' + siteId + '/themes/mine' }, fn );
};

Undocumented.prototype.activateTheme = function( theme, siteId, fn ) {
	debug( '/sites/:site_id/themes/mine' );
	return this.wpcom.req.post( {
		path: '/sites/' + siteId + '/themes/mine',
		body: { theme: theme.id }
	}, fn );
};

Undocumented.prototype.emailForwards = function( domain, callback ) {
	this.wpcom.req.get( '/domains/' + domain + '/email', function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.addEmailForward = function( domain, mailbox, destination, callback ) {
	this.wpcom.req.post( '/domains/' + domain + '/email/new', {}, {
		mailbox: mailbox,
		destination: destination
	}, function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.deleteEmailForward = function( domain, mailbox, callback ) {
	this.wpcom.req.post( '/domains/' + domain + '/email/' + mailbox + '/delete', {}, {}, function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.resendVerificationEmailForward = function( domain, mailbox, callback ) {
	this.wpcom.req.post( '/domains/' + domain + '/email/' + mailbox + '/resend-verification', {}, {}, function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.nameservers = function( domain, callback ) {
	this.wpcom.req.get( '/domains/' + domain + '/nameservers', function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.updateNameservers = function( domain, nameservers, callback ) {
	this.wpcom.req.post( '/domains/' + domain + '/nameservers/', {}, nameservers, function( error, response ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, response );
	} );
};

Undocumented.prototype.resendIcannVerification = function( domain, callback ) {
	this.wpcom.req.post( '/domains/' + domain + '/resend-icann/', callback );
};

Undocumented.prototype.fetchDns = function( domainName, fn ) {
	this.wpcom.req.get( '/domains/' + domainName + '/dns', fn );
};

Undocumented.prototype.updateDns = function( domain, records, fn ) {
	var filtered = reject( records, 'isBeingDeleted' ),
		body = { dns: JSON.stringify( filtered ) };

	this.wpcom.req.post( '/domains/' + domain + '/dns', body, fn );
};

Undocumented.prototype.fetchWapiDomainInfo = function( domainName, fn ) {
	this.wpcom.req.get( '/domains/' + domainName + '/status', fn );
};

Undocumented.prototype.requestTransferCode = function( options, fn ) {
	var { domainName, unlock, disablePrivacy } = options,
		data = {
			domainStatus: JSON.stringify( {
				command: 'send-code',
				payload: {
					unlock,
					disable_privacy: disablePrivacy
				}
			} )
		};

	this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.enableDomainLocking = function( { domainName, enablePrivacy, declineTransfer }, fn ) {
	var data = {
		domainStatus: JSON.stringify( {
			command: 'lock-domain',
			payload: {
				enable_privacy: enablePrivacy,
				decline_transfer: declineTransfer
			}
		} )
	};

	this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.enablePrivacyProtection = function( domainName, fn ) {
	var data = {
		domainStatus: JSON.stringify( { command: 'enable-privacy' } )
	};

	this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.acceptTransfer = function( domainName, fn ) {
	var data = {
		domainStatus: JSON.stringify( { command: 'accept-transfer' } )
	};

	this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

Undocumented.prototype.declineTransfer = function( domainName, fn ) {
	var data = {
		domainStatus: JSON.stringify( { command: 'deny-transfer' } )
	};

	this.wpcom.req.post( '/domains/' + domainName + '/transfer', data, fn );
};

/*
 * Retrieves WHOIS data for given domain.
 *
 * @param {string} [domainName]
 * @param {Function} [fn]
 */
Undocumented.prototype.fetchWhois = function( domainName, fn ) {
	debug( '/domains/:domainName/whois query' );
	this.wpcom.req.get( `/domains/${ domainName }/whois`, fn );
};

/*
 * Updates WHOIS data for given domain.
 *
 * @param {string} [domainName]
 * @param {Object} [whois]
 * @param {Function} [fn]
 */
Undocumented.prototype.updateWhois = function( domainName, whois, fn ) {
	debug( '/domains/:domainName/whois' );
	this.wpcom.req.post( {
		path: `/domains/${ domainName }/whois`,
		apiVersion: '1.1',
		body: {
			whois: whois
		}
	}, fn );
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
	return this.wpcom.req.post( {
		path: `/sites/${ siteId }/vip-domain-mapping`,
		body: {
			domain: domainName
		}
	}, fn );
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
	return this.wpcom.req.post( {
		path: '/sites/' + siteSlug + '/themes/mine',
		body: data
	}, fn );
};

Undocumented.prototype.sitePurchases = function( siteId, fn ) {
	debug( '/site/:site_id/purchases' );
	this.wpcom.req.get( { path: '/sites/' + siteId + '/purchases' }, fn );
};

Undocumented.prototype.googleAppsFilterByDomain = function( domainName, fn ) {
	debug( '/domains/:domainName/google-apps' );
	return this.wpcom.req.get( { path: '/domains/' + domainName + '/google-apps' }, fn );
};

Undocumented.prototype.googleAppsFilterBySiteId = function( siteId, fn ) {
	debug( '/sites/:siteId/google-apps' );
	return this.wpcom.req.get( { path: '/sites/' + siteId + '/google-apps' }, fn );
};

Undocumented.prototype.deleteWPCOMFollower = function( siteId, followerId, fn ) {
	debug( '/site/:site_id/follower/:follower_id/delete' );
	this.wpcom.req.post( { path: '/sites/%s/follower/%d/delete' }, fn );
};

Undocumented.prototype.deleteEmailFollower = function( siteId, followerId, email, fn ) {
	debug( '/site/:site_id/follower/:follower_id/delete' );
	this.wpcom.req.post( {
		path: '/sites/%s/follower/%d/delete',
		body: { email: email }
	}, fn );
};

Undocumented.prototype.fetchImporterState = function( siteId ) {
	debug( `/sites/${ siteId }/importer/` );

	return this.wpcom.req.get( { path: `/sites/${ siteId }/imports/` } );
};

Undocumented.prototype.updateImporter = function( siteId, importerStatus ) {
	debug( `/sites/${ siteId }/imports/${ importerStatus.importId }` );

	return this.wpcom.req.post( {
		path: `/sites/${ siteId }/imports/${ importerStatus.importerId }`,
		formData: [
			[ 'importStatus', JSON.stringify( importerStatus ) ]
		]
	} );
};

Undocumented.prototype.uploadExportFile = function( siteId, params ) {
	return new Promise( ( resolve, reject ) => {
		const resolver = ( error, data ) => {
			error ? reject( error ) : resolve( data );
		};

		const req = this.wpcom.req.post( {
			path: `/sites/${ siteId }/imports/new`,
			formData: [
				[ 'importStatus', JSON.stringify( params.importStatus ) ],
				[ 'import', params.file ]
			]
		}, resolver );

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

	this.wpcom.req.get( '/help/search', {
		query: searchQuery
	}, fn );
};

Undocumented.prototype.cancelPurchase = function( purchaseId, fn ) {
	debug( 'upgrades/{purchaseId}/disable-auto-renew' );

	this.wpcom.req.post( {
		path: `/upgrades/${purchaseId}/disable-auto-renew`
	}, fn );
};

Undocumented.prototype.cancelAndRefundPurchase = function( purchaseId, data, fn ) {
	debug( 'upgrades/{purchaseId}/cancel' );

	this.wpcom.req.post( {
		path: `/upgrades/${purchaseId}/cancel`,
		body: data
	}, fn );
};

Undocumented.prototype.cancelPrivateRegistration = function( purchaseId, fn ) {
	debug( 'upgrades/{purchaseId}/cancel-privacy-protection' );

	this.wpcom.req.post( {
		path: `/upgrades/${purchaseId}/cancel-privacy-protection`,
		apiVersion: '1.1'
	}, fn );
};

Undocumented.prototype.cancelPlanTrial = function( planId, fn ) {
	debug( '/upgrades/{planId}/cancel-plan-trial' );

	this.wpcom.req.post( {
		path: `/upgrades/${planId}/cancel-plan-trial`
	}, fn );
};

Undocumented.prototype.submitKayakoTicket = function( subject, message, locale, client, fn ) {
	debug( 'submitKayakoTicket' );

	this.wpcom.req.post( {
		path: '/help/tickets/kayako/new',
		body: { subject, message, locale, client }
	}, fn );
};

/**
 * Get the olark configuration for the current user
 *
 * @param {Object} client - current user
 * @param {Function} fn The callback function
 * @api public
 */
Undocumented.prototype.getOlarkConfiguration = function( client, fn ) {
	this.wpcom.req.get( {
		apiVersion: '1.1',
		path: '/help/olark/mine',
		body: { client }
	}, fn );
};

Undocumented.prototype.submitSupportForumsTopic = function( subject, message, client, fn ) {
	this.wpcom.req.post( {
		path: '/help/forums/support/topics/new',
		body: { subject, message, client }
	}, fn );
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
	return this.wpcom.withLocale().req.get( {
		apiVersion: '1.1',
		path: `/sites/${ siteId }/exports/settings`
	}, fn );
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
	return this.wpcom.withLocale().req.post( {
		apiVersion: '1.1',
		path: `/sites/${ siteId }/exports/start`
	}, advancedSettings, fn );
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
	return this.wpcom.withLocale().req.get( {
		apiVersion: '1.1',
		path: `/sites/${ siteId }/exports/${ exportId }`
	}, fn );
};

Undocumented.prototype.timezones = function( params, fn ) {
	if ( typeof params === 'function' ) {
		fn = params;
		params = {};
	}

	let query = Object.assign( {}, params, { apiNamespace: 'wpcom/v2' } );
	return this.wpcom.req.get( '/timezones', query, fn );
};

/**
 * Check different info about WordPress and Jetpack status on a url
 *
 * @param {String} targetUrl - The url of the site to check
 * @param {String} filters - Comma separated string with the filters to run
 * @returns {Promise}  promise
 */
Undocumented.prototype.getSiteConnectInfo = function( targetUrl, filters ) {
	const parsedUrl = url.parse( targetUrl );
	let endpointUrl = `/connect/site-info/${ parsedUrl.protocol.slice( 0, -1 ) }/${ parsedUrl.host }`;
	let params = {
		filters: filters,
		apiVersion: '1.1',
	};

	if ( parsedUrl.path && parsedUrl.path !== '/' ) {
		endpointUrl += parsedUrl.path.replace( /\//g, '::' );
	}

	return this.wpcom.req.get( `${ endpointUrl }`, params );
};

/**
 * Post an url to be stored under user's settings,
 * so we can know that they have started a jetpack-connect flow for that site
 *
 * @param {String} targetUrl          The url of the site to store
 * @returns {Promise} Promise
 */
Undocumented.prototype.storeJetpackConnectUrl = function( targetUrl ) {
	return this.wpcom.req.post( { path: '/me/settings' }, {}, {
		jetpack_connect: targetUrl
	} );
};

/**
 * Exports the user's Reader feed as an OPML XML file.
 * A JSON object is returned with the XML given as a String
 * in the `opml` field.
 *
 * @param {Function} fn           The callback function
 */
Undocumented.prototype.exportReaderFeed = function( fn ) {
	debug( '/read/following/mine/export' );
	const query = {
		apiVersion: '1.2',
	};
	this.wpcom.req.get( '/read/following/mine/export', query, fn );
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
		formData: [
			[ 'import', file ]
		]
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
	return this.wpcom.req.post( { path: '/devices/new' }, {}, {
		device_token: registration,
		device_family: deviceFamily,
		device_name: deviceName
	}, fn );
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
 * @returns {XMLHttpRequest}          The XHR instance
 */
Undocumented.prototype.wordAdsApprove = function( siteId ) {
	debug( '/sites/:site:/wordads/approve' );
	return this.wpcom.req.post( '/sites/' + siteId + '/wordads/approve' );
};

/**
 * Requests the status of a guided transfer
 *
 * @param {int} siteId  The site ID
 * @returns {Promise} Resolves to the response containing the transfer status
 */
Undocumented.prototype.getGuidedTransferStatus = function( siteId ) {
	debug( '/sites/:site:/transfer' );
	return this.wpcom.req.get( '/sites/' + siteId + '/transfer', {
		apiNamespace: 'wpcom/v2'
	} );
};

/**
 * Expose `Undocumented` module
 */
module.exports = Undocumented;
