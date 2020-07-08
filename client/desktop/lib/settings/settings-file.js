/**
 * External Dependencies
 */
const { app } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies
const path = require( 'path' );
const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
const Config = require( '../config' );
const log = require( 'desktop/lib/logger' )( 'desktop:settings' );

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
				log.error( 'Failed to read settings file' );
			}
		}

		firstRun = true;
		try {
			createSettingsFile( getSettingsFile() );
		} catch ( e ) {
			log.error( 'Failed to create settings file' );
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

			// Read the existing settings
			data = fs.readFileSync( settingsFile );

			log.info( `Read settings from '${ settingsFile }': ${ data.toString( 'utf-8' ) }` );

			data = JSON.parse( data );
			data[ group ] = groupData;

			log.info( `Updating settings: '${ group }': `, groupData );
			fs.writeFileSync( settingsFile, JSON.stringify( data ) );
		} catch ( error ) {
			log.error( 'Failed to read settings file', error );
		}

		return data;
	},

	isFirstRun: function () {
		return firstRun;
	},
};
