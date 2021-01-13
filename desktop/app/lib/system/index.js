/**
 * External Dependencies
 */
const { execSync } = require( 'child_process' ); // eslint-disable-line import/no-nodejs-modules
const os = require( 'os' ); // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
const Platform = require( 'app/lib/platform' );
const config = require( 'app/lib/config' );
const SettingsFile = require( 'app/lib/settings/settings-file' );
const APPS_DIRECTORY = '/Applications';
const log = require( 'app/lib/logger' )( 'desktop:system' );

function isPinned() {
	if ( Platform.isOSX() ) {
		try {
			const cmd = "defaults read com.apple.dock persistent-apps | grep 'WordPress.com'";

			execSync( cmd, {} );
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
	getDetails: function () {
		const details = {
			pinned: isPinned(),
			platform: Platform.getPlatformString(),
			installed: isInstalled(),
			firstRun: isFirstRun(),
		};

		log.info( 'System details: ', details );
		return details;
	},
	getVersionData: function () {
		return {
			platform: process.platform,
			release: os.release(),
			version: config.version,
			build: config.build,
		};
	},
};
