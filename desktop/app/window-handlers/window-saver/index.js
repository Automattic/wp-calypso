/**
 * External Dependencies
 */
const { debounce } = require( 'lodash' );

/**
 * Internal dependencies
 */
const Settings = require( 'app/lib/settings' );

/**
 * Module variables
 */
const SAVE_SETTINGS_DELAY = 1000;

module.exports = function ( mainWindow ) {
	const settingSaver = debounce( function () {
		Settings.saveSetting( 'window', mainWindow.getBounds() );
	}, SAVE_SETTINGS_DELAY );

	mainWindow.on( 'resize', function () {
		settingSaver();
	} );

	mainWindow.on( 'move', function () {
		settingSaver();
	} );
};
