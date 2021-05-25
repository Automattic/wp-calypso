/**
 * External Dependencies
 */
const { debounce } = require( 'lodash' );

/**
 * Internal dependencies
 */
const Settings = require( '../../lib/settings' );

/**
 * Module variables
 */
const SAVE_SETTINGS_DELAY = 1000;

module.exports = function ( { window } ) {
	const settingSaver = debounce( function () {
		Settings.saveSetting( 'window', window.getBounds() );
	}, SAVE_SETTINGS_DELAY );

	window.on( 'resize', function () {
		settingSaver();
	} );

	window.on( 'move', function () {
		settingSaver();
	} );
};
