'use strict';

/**
 * External Dependencies
 */
const app = require( 'electron' ).app;
const path = require( 'path' );
const fs = require( 'fs' );
const debug = require( 'debug' )( 'desktop:settings' );

/**
 * Internal dependencies
 */
const Config = require( '../config' );

let firstRun = false;

function getSettingsFile() {
	return path.join( app.getPath( 'userData' ), Config.settings_filename );
}

function createSettingsFile( settingsFile ) {
	// Create the file
	fs.writeFileSync( settingsFile, JSON.stringify( Config.default_settings ) );
}

module.exports = {
	load: function() {
		const settingsFile = getSettingsFile();

		if ( fs.existsSync( settingsFile ) ) {
			try {
				return JSON.parse( fs.readFileSync( settingsFile ) );
			} catch ( e ) {
				debug( 'Error reading settings file' );
			}
		}

		firstRun = true;
		try {
			createSettingsFile( getSettingsFile() );
		} catch ( e ) {
			debug( 'Error creating settings file' );
		}
		return {};
	},

	save: function( group, groupData ) {
		const settingsFile = getSettingsFile();
		let data = {};

		try {
			if ( !fs.existsSync( settingsFile ) ) {
				createSettingsFile( settingsFile );
			}

			// Read the existing settings
			data = fs.readFileSync( settingsFile );

			debug( 'Read settings from ' + settingsFile, data.toString( 'utf-8' ) );

			data = JSON.parse( data );
			data[group] = groupData;

			debug( 'Updating settings: ' + group, groupData );
			fs.writeFileSync( settingsFile, JSON.stringify( data ) );
		} catch ( error ) {
			debug( 'Failed to read settings file', error );
		}

		return data;
	},

	isFirstRun: function() {
		return firstRun;
	}
}
