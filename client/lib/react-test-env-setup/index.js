/**
 * External dependencies
 */
var jsdom = require( 'jsdom' ).jsdom,
	assign = require( 'lodash/object/assign' );

/**
 * Module variables
 */
var defaultFeatures = {
	localStorage: true,
	XMLHttpRequest: true
};

module.exports = function( markup, features ) {
	features = assign( {}, defaultFeatures, features );

	global.document = jsdom( markup );
	global.window = document.parentWindow;
	global.navigator = window.navigator;
	global.Element = window.Element;

	if ( features.localStorage ) {
		require( 'lib/local-storage' )( global );
	}

	if ( features.XMLHttpRequest ) {
		global.XMLHttpRequest = window.XMLHttpRequest;
	}
};
