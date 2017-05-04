// Note: This is used by env.js and so do not require( 'debug' ) in the global context otherwise it prevents env.js setting debug up
/**
 * Internal dependencies
 */
const Config = require( '../config' );
const settingsFile = require( './settings-file' );

/**
 * Module variables
 */
let settings = false;

function Settings() {
	this.settings = false;
}

Settings.prototype._getAll = function() {
	if ( this.settings === false ) {
		this.settings = settingsFile.load();
	}

	return this.settings;
};

Settings.prototype.isDebug = function() {
	if ( typeof this._getAll().debug !== 'undefined' ) {
		return this._getAll().debug;
	}
	return Config.debug.enabled_by_default;
};

/**
 * Get a single setting value
 * If no setting is present then fall back to the `default_settings`
 * If no default setting then fall back to false
 * @param {String} setting A key to access a corresponding settings value
 * @return {*} The value of a setting || default setting || false
 */
Settings.prototype.getSetting = function( setting ) {
	const value = this._getAll()[ setting ];
	const debug = require( 'debug' )( 'desktop:settings' );

	if ( typeof value === 'undefined' ) {
		if ( typeof Config.default_settings[ setting ] !== 'undefined' ) {
			debug( 'Get default setting for ' + setting + ' = ' + Config.default_settings[ setting ] );
			return Config.default_settings[ setting ];
		}

		debug( 'Get setting with no defaults for ' + setting );
		return false;
	}

	debug( 'Get setting for ' + setting + ' = ' + value );
	return value;
};

/**
 * Get a group of settings
 * @param {{}} existing default values to use
 * @param {String} group a settings group name
 * @param {Array} values optional array of values to override
 * @returns {{}} A group of matched settings || existing values
 */
Settings.prototype.getSettingGroup = function( existing, group, values ) {
	const debug = require( 'debug' )( 'desktop:settings' );

	debug( 'Get settings for ' + group + ' = ' + values );

	if ( typeof this._getAll()[ group ] !== 'undefined' ) {
		if ( values instanceof Array ) {
			for ( let x = 0; x < values.length; x++ ) {
				const value = values[ x ];

				existing[ value ] = this._getAll()[ group ][ value ];
			}
		} else {
			return this._getAll()[ group ];
		}
	}

	return existing;
};

Settings.prototype.saveSetting = function( group, groupData ) {
	this.settings = settingsFile.save( group, groupData );
};

if ( ! settings ) {
	settings = new Settings();
}

module.exports = settings;
