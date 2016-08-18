/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:user:settings' ),
	merge = require( 'lodash/merge' ),
	assign = require( 'lodash/assign' ),
	keys = require( 'lodash/keys' ),
	decodeEntities = require( 'lib/formatting' ).decodeEntities,
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var emitterClass = require( 'lib/mixins/emitter' ),
	wpcom = require( 'lib/wp' ).undocumented(),
	user = require( 'lib/user' )(),
	userUtils = require( 'lib/user/utils' );
/*
 * Decodes entities in those specific user settings properties
 * that the REST API returns already HTML-encoded
 */
function decodeUserSettingsEntities( data ) {
	let decodedValues = {
		display_name: data.display_name && decodeEntities( data.display_name ),
		description: data.description && decodeEntities( data.description ),
		user_URL: data.user_URL && decodeEntities( data.user_URL )
	};

	return assign( {}, data, decodedValues );
}

/**
 * Initialize UserSettings with defaults
 *
 * @return {Undefined} undefined
 */
function UserSettings() {
	if ( ! ( this instanceof UserSettings ) ) {
		return new UserSettings();
	}

	this.settings = false;
	this.initialized = false;
	this.reAuthRequired = false;
	this.fetchingSettings = false;
	this.unsavedSettings = {};
}

emitterClass( UserSettings.prototype );

/**
 * Returns a boolean signifying whether there are settings or not
 *
 * @return {Boolean} true is the user has settings object
 */
UserSettings.prototype.hasSettings = function() {
	return !! this.settings;
};

/**
 * Get user settings. If not already initialized, then fetch settings
 *
 * @return {Object} user setting object
 */
UserSettings.prototype.getSettings = function() {
	if ( ! this.settings ) {
		this.fetchSettings();
	}
	return this.settings;
};

/**
 * Fetch user settings from WordPress.com API and store them in UserSettings instance
 */
UserSettings.prototype.fetchSettings = function() {
	if ( ! userUtils.isLoggedIn() || this.fetchingSettings ) {
		return;
	}

	this.fetchingSettings = true;

	debug( 'Fetching user settings' );

	wpcom.me().settings().get( function( error, data ) {
		if ( ! error ) {
			this.settings = decodeUserSettingsEntities( data );
			this.initialized = true;
			this.emit( 'change' );
		}

		this.fetchingSettings = false;

		debug( 'Settings successfully retrieved' );
	}.bind( this ) );
};

/**
 * Post settings to WordPress.com API at /me/settings endpoint
 *
 * @param {Function} callback - callback function
 * @param {Object} settingsOverride - default settings object
 * @return {Null} null
 */
UserSettings.prototype.saveSettings = function( callback, settingsOverride ) {
	var settings = settingsOverride ? settingsOverride : this.unsavedSettings;

	if ( isEmpty( settings ) ) {
		debug( 'There are no settings to save.' );
		callback( null );
		return false;
	}

	debug( 'Saving settings: ' + JSON.stringify( settings ) );

	wpcom.me().settings().update( settings, function( error, data ) {
		if ( ! error ) {
			this.settings = decodeUserSettingsEntities( merge( this.settings, data ) );

			// Do not reset unsaved settings if settingsOverride was passed
			if ( ! settingsOverride ) {
				this.unsavedSettings = {};
			} else {
				// Removed freshly saved data from unsavedSettings
				keys( data )
					.forEach( x => delete this.unsavedSettings[ x ] );
			}

			this.emit( 'change' );

			// Refetch the user data after saving user settings
			user.fetch();
		}

		// Let the form know whether the save was successful or not
		callback( error, data );
	}.bind( this ) );
};

UserSettings.prototype.cancelPendingEmailChange = function( callback ) {
	wpcom.me().settings().update( { user_email_change_pending: false }, function( error, data ) {
		if ( ! error ) {
			this.settings = merge( this.settings, data );
			this.emit( 'change' );
		}

		// Let the form know whether the email change was successfully cancelled or not
		callback( error, data );
	}.bind( this ) );
};

/**
 * Given a settingName, returns that original setting if it exists or null
 *
 * @param {String} settingName - setting name
 * @return {*} setting key value
 */
UserSettings.prototype.getOriginalSetting = function( settingName ) {
	var setting = null;
	if ( this.settings && this.settings[ settingName ] ) {
		setting = this.settings[ settingName ];
	}

	return setting;
};

/**
 * Is two-step enabled for the current user?
 *
 * @return {Boolean} return true if two-step is enabled
 */
UserSettings.prototype.isTwoStepEnabled = function() {
	return this.settings ? this.settings.two_step_enabled : false;
};

/**
 * Is two-step sms enabled for the current user?
 *
 * @return {Boolean} return true if two-step sms is enabled
 */
UserSettings.prototype.isTwoStepSMSEnabled = function() {
	return this.settings ? this.settings.two_step_sms_enabled : false;
};

/**
 * Returns true if there is a pending email change, false if not.
 *
 * @return {Boolean} pending email state
 */
UserSettings.prototype.isPendingEmailChange = function() {
	if ( this.settings ) {
		return !! this.settings.new_user_email;
	}

	return false;
};

/**
 * Given a settingName, returns that setting if it exists or null
 *
 * @param {String}  settingName - setting name
 * @return {*} setting name value
 */
UserSettings.prototype.getSetting = function( settingName ) {
	var setting = null;

	// If we haven't fetched settings, or if the setting doesn't exist return null
	if ( this.settings && 'undefined' !== typeof this.settings[ settingName ] ) {
		setting = ( 'undefined' !== typeof this.unsavedSettings[ settingName ] )
			? this.unsavedSettings[ settingName ]
			: this.settings[ settingName ];
	}

	return setting;
};

/**
 * Handles the storage and removal of changed setting that are pending
 * being saved to the WPCOM API.
 *
 * @param {String} settingName - setting name
 * @param {*} value - setting value
 * @return {Boolean} updating successful response
 */
UserSettings.prototype.updateSetting = function( settingName, value ) {
	if ( this.settings && 'undefined' !== typeof this.settings[ settingName ] ) {
		this.unsavedSettings[ settingName ] = value;

		/*
		 * If the two match, we don't consider the setting "changed".
		 * user_login is a special case since the logic for validating and saving a username
		 * is more complicated.
		 */
		if (
			this.settings[ settingName ] === this.unsavedSettings[ settingName ] &&
			'user_login' !== settingName
		) {
			debug( 'Removing ' + settingName + ' from changed settings.' );
			delete this.unsavedSettings[ settingName ];
		}

		this.emit( 'change' );
		return true;
	} else {
		debug( settingName + ' does not exist in user-settings data module.' );
		return false;
	}
};

UserSettings.prototype.isSettingUnsaved = function( settingName ) {
	return ( settingName in this.unsavedSettings );
};

UserSettings.prototype.removeUnsavedSetting = function( settingName ) {
	if ( settingName in this.unsavedSettings ) {
		delete this.unsavedSettings[ settingName ];

		this.emit( 'change' );
	}
};

UserSettings.prototype.hasUnsavedSettings = function() {
	return ! isEmpty( this.unsavedSettings );
};

/**
 * Expose UserSettings
 */
module.exports = new UserSettings();
