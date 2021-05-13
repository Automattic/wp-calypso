/**
 * External Dependencies
 */
const { app } = require( 'electron' );
const path = require( 'path' );
const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
const Config = require( '../config' );
const log = require( '../../lib/logger' )( 'desktop:settings' );

let firstRun = false;

function getSettingsFile() {
	return path.join( app.getPath( 'userData' ), Config.settings_filename );
}

function createSettingsFile( settingsFile ) {
	// Create the file
	fs.writeFileSync( settingsFile, JSON.stringify( Config.default_settings ) );
}

module.exports = {
	load: function () {
		const settingsFile = getSettingsFile();

		if ( fs.existsSync( settingsFile ) ) {
			try {
				return JSON.parse( fs.readFileSync( settingsFile ) );
			} catch ( e ) {
				log.error( 'Failed to load settings file: ', e );
			}
		}

		firstRun = true;
		try {
			createSettingsFile( getSettingsFile() );
		} catch ( e ) {
			log.error( 'Failed to create settings file: ', e );
		}
		return {};
	},

	save: function ( group, groupData ) {
		const settingsFile = getSettingsFile();
		let data = {};

		try {
			if ( ! fs.existsSync( settingsFile ) ) {
				createSettingsFile( settingsFile );
			}

			// Read existing settings
			data = fs.readFileSync( settingsFile );

			data = JSON.parse( data );
			data[ group ] = groupData;

			fs.writeFileSync( settingsFile, JSON.stringify( data ) );
		} catch ( error ) {
			log.error( `Failed to write settings '${ group }' to file:`, error );
		}

		return data;
	},

	isFirstRun: function () {
		return firstRun;
	},
};
