/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:site' ),
	i18n = require( 'i18n-calypso' ),
	isEqual = require( 'lodash/isEqual' ),
	find = require( 'lodash/find' ),
	omit = require( 'lodash/omit' ),
	trim = require( 'lodash/trim' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	config = require( 'config' ),
	notices = require( 'notices' ),
	Emitter = require( 'lib/mixins/emitter' ),
	isHttps = require( 'lib/url' ).isHttps;

function Site( attributes ) {
	if ( ! ( this instanceof Site ) ) {
		return new Site( attributes );
	}

	this.attributes( attributes );
}

function settingsErrorHandler( error, site ) {
	var adminURL = site.options ? site.options.admin_url : '';
	switch ( error.statusCode ) {
		case 0:
			notices.error( i18n.translate( 'There was an error retrieving your site settings. Please check your internet connection.' ) );
			break;
		case 400:
			notices.error( i18n.translate( 'There was an error retrieving your site settings.' ), {
				button: i18n.translate( 'Make sure your Jetpack is up to date' ),
				href: adminURL + 'plugins.php?plugin_status=upgrade'
			} );
			break;
		case 401:
			notices.error( i18n.translate( 'You must be logged in to manage site settings.' ) );
			break;
		case 403:
			notices.error( i18n.translate( 'You are not authorized to manage settings for this site.' ) );
			break;
	}
}
/**
 * Mixins
 */
Emitter( Site.prototype );

Site.prototype.attributes = function( attributes ) {
	attributes = attributes || {};

	for ( var prop in attributes ) {
		if ( attributes.hasOwnProperty( prop ) ) {
			this[ prop ] = attributes[ prop ];
		}
	}
	this.setMaxListeners( 40 );
	this.updateComputedAttributes();
};

Site.prototype.set = function( attributes ) {
	var changed = false;

	for ( var prop in attributes ) {
		if ( attributes.hasOwnProperty( prop ) && ! isEqual( attributes[ prop ], this[ prop ] ) ) {
			this[ prop ] = attributes[ prop ];
			changed = true;
		}
	}

	this.updateComputedAttributes();

	if ( changed ) {
		this.emit( 'change' );
	}

	return changed;

};

/**
 * Update any computed attributes
 */
Site.prototype.updateComputedAttributes = function() {
	/**
	 * If the user has no access to site.options create it as an empty
	 * attribute to avoid potential errors when trying to access its sub properties
	 */
	this.options = this.options || {};

	// Add URL without protocol as a `domain` attribute
	if ( this.URL ) {
		this.domain = this.URL.replace( /^https?:\/\//, '' );
		this.slug = this.domain.replace( /\//g, '::' );
	}
	this.title = trim( this.name ) || this.domain;

	// If a WordPress.com site has a mapped domain create a `wpcom_url`
	// attribute to allow site selection with either domain.
	if ( this.options && this.options.is_mapped_domain && ! this.is_jetpack ) {
		this.wpcom_url = this.options.unmapped_url.replace( /^https?:\/\//, '' );
	}

	// If a site has an `is_redirect` property use the `unmapped_url`
	// for the slug and domain to match the wordpress.com original site.
	if ( ( this.options && this.options.is_redirect ) || this.hasConflict ) {
		this.slug = this.options.unmapped_url.replace( /^https?:\/\//, '' );
		this.domain = this.slug;
	}

	// The 'standard' post format is saved as an option of '0'
	if ( ! this.options.default_post_format || this.options.default_post_format === '0' ) {
		this.options.default_post_format = 'standard';
	}
	this.is_previewable = !! (
		config.isEnabled( 'preview-layout' ) &&
		this.options.unmapped_url &&
		! this.is_vip &&
		isHttps( this.options.unmapped_url )
	);
	this.is_customizable = !! (
		this.capabilities &&
		this.capabilities.edit_theme_options
	);
};

/**
 * Get full settings data, accepts optional siteID
 * to allow calling on an empty Site object.
 */
Site.prototype.fetchSettings = function( siteID ) {
	var requestID = this.ID || siteID;
	this.set( { fetchingSettings: true } );
	wpcom.undocumented().settings( requestID, function( error, data ) {
		if ( error ) {
			settingsErrorHandler( error, this );
			debug( 'error fetching site settings data from api', error );
			return;
		}

		// settings endpoint is a superset of Site and can be set on top of Site
		data.latestSettings = new Date().getTime();
		data.fetchingSettings = false;
		this.set( data );

	}.bind( this ) );
};

/**
 * Save settings data by calling out to rest api
 * @param  {object}   newSettings updated settings
 * @param  {Function} callback    function to call when request resolves
 */
Site.prototype.saveSettings = function( newSettings, callback ) {

	var reflectSavedSettings = function( savedSettings ) {

		var settings = this.settings,
			updatedAttributes = { settings: settings },
			key;

		for ( key in savedSettings ) {

			if ( ! savedSettings.hasOwnProperty( key ) ) {
				continue;
			}

			if ( 'blogname' === key ) {
				updatedAttributes.name = newSettings.blogname;
			}
			if ( 'blogdescription' === key ) {
				updatedAttributes.description = newSettings.blogdescription;
			}

			settings[ key ] = savedSettings[ key ];

		}

		updatedAttributes.settings = settings;

		this.set( updatedAttributes );

	}.bind( this );

	if ( 'string' === typeof newSettings.whitelistString ) {
		newSettings.jetpack_protect_whitelist = newSettings.whitelistString.split( "\n" );
		newSettings = omit( newSettings, 'whitelistString' );
	}

	wpcom.undocumented().settings( this.ID, 'post', newSettings, function( error, data ) {

		if ( ! error && data.updated ) {

			reflectSavedSettings( data.updated );

		}
		callback( error, data );
	} );

};

/**
 * Returns a site user object by user ID
 *
 * @param  {int} userId The user ID to retrieve
 */
Site.prototype.getUser = function( userId ) {
	return find( this.getUsers(), { ID: userId } );
};

/**
 * Returns all of the site's users. Triggers a fetch if user data doesn't
 * already exist.
 */
Site.prototype.getUsers = function() {
	if ( ! this.users ) {
		this.users = [];
		this.fetchUsers();
	}

	return this.users;
};

/**
 * Triggers a network request to fetch all users for the current site. Emits a
 * "change" event when the users have been fetched.
 */
Site.prototype.fetchUsers = function() {
	if ( this.fetchingUsers ) {
		return;
	}

	this.fetchingUsers = true;

	wpcom.site( this.ID ).usersList( function( error, data ) {
		if ( error || ! data.users ) {
			debug( 'error fetching site users data from api', error );
			return;
		}

		this.set( { users: data.users } );
		this.fetchingUsers = false;
		this.emit( 'usersFetched' );
	}.bind( this ) );
};

Site.prototype.isUpgradeable = function() {
	return this.capabilities && this.capabilities.manage_options;
};

Site.prototype.isCustomizable = function() {
	return !! ( this.capabilities && this.capabilities.edit_theme_options );
};

module.exports = Site;
