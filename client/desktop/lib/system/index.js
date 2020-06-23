'use strict';

/**
 * External Dependencies
 */

const Platform = require( 'desktop/lib/platform' );
const exec = require( 'child_process' ).execSync;
const os = require( 'os' );

/**
 * Internal dependencies
 */
const config = require( 'desktop/lib/config' );
const SettingsFile = require( 'desktop/lib/settings/settings-file' );
const APPS_DIRECTORY = '/Applications';
const log = require( 'desktop/lib/logger' )( 'desktop:system' );

function isPinned() {
	if ( Platform.isOSX() ) {
		try {
			let cmd = "defaults read com.apple.dock persistent-apps | grep 'WordPress.com'";

			exec( cmd, {} );
			return true;
		} catch ( e ) {
			return false;
		}
	}

	return false;
}

function isInstalled() {
	if ( __dirname.substr( 0, APPS_DIRECTORY.length ) === APPS_DIRECTORY ) {
		return true;
	}

	return false;
}

function isFirstRun() {
	return SettingsFile.isFirstRun();
}

module.exports = {
	getDetails: function() {
		let details = {
			pinned: isPinned(),
			platform: Platform.getPlatformString(),
			installed: isInstalled(),
			firstRun: isFirstRun()
		}

		log.info( 'System details: ', details );
		return details;
	},
	getVersionData: function() {
		return {
			platform: process.platform,
			release: os.release(),
			version: config.version,
			build: config.build,
		};
	}
};
