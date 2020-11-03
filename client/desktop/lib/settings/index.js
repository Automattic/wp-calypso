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

Settings.prototype._getAll = function () {
	if ( this.settings === false ) {
		this.settings = settingsFile.load();
	}

	return this.settings;
};

Settings.prototype.isDebug = function () {
	if ( typeof this._getAll().debug !== 'undefined' ) return this._getAll().debug;
	return Config.debug.enabled_by_default;
};

/*
 * Get a single setting value
 * If no setting is present then fall back to the `default_settings`
 * If no default setting then fall back to false
 */
Settings.prototype.getSetting = function ( setting ) {
	const value = this._getAll()[ setting ];
	const log = require( 'calypso/desktop/lib/logger' )( 'desktop:settings' );

	if ( typeof value === 'undefined' ) {
		if ( typeof Config.default_settings[ setting ] !== 'undefined' ) {
			return Config.default_settings[ setting ];
		}
		return false;
	}

	return value;
};

/*
 * Get a group of settings
 */
Settings.prototype.getSettingGroup = function ( existing, group, values ) {
	const log = require( 'calypso/desktop/lib/logger' )( 'desktop:settings' );

	const settingsGroup = this._getAll()[ group ];

	if ( typeof settingsGroup !== 'undefined' ) {
		if ( values instanceof Array ) {
			const updated = {};
			for ( let x = 0; x < values.length; x++ ) {
				const value = values[ x ];
				existing[ value ] = settingsGroup[ value ];
				updated[ value ] = settingsGroup[ value ];
			}
		} else {
			return settingsGroup;
		}
	}

	return existing;
};

Settings.prototype.saveSetting = function ( group, groupData ) {
	this.settings = settingsFile.save( group, groupData );
};

if ( ! settings ) {
	settings = new Settings();
}

module.exports = settings;
