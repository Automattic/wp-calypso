/**
 * External dependencies
 */
var jsdom = require( 'jsdom' ).jsdom,
	assign = require( 'lodash/assign' );

/**
 * Module variables
 */
var defaultFeatures = {
	localStorage: true,
	XMLHttpRequest: true
};

module.exports = function( markup, features ) {
	features = assign( {}, defaultFeatures, features );

	global.document = jsdom( markup, {
		url: 'http://example.com/',
		features: {
			FetchExternalResources: false,
			ProcessExternalResources: false
		}
	} );
	global.window = document.defaultView;
	global.navigator = window.navigator;
	global.Element = window.Element;
	global.history = window.history;

	if ( features.localStorage ) {
		require( 'lib/local-storage' )( global );
	}

	if ( features.XMLHttpRequest ) {
		global.XMLHttpRequest = window.XMLHttpRequest;
	}
};

module.exports.cleanup = function() {
	delete global.document;
	delete global.window;
	delete global.navigator;
	delete global.Element;
	delete global.history;
	delete global.localStorage;
	delete global.XMLHttpRequest;
};

module.exports.auto = function( markup, features ) {
	before( function() {
		module.exports( markup, features );
	} );

	after( function() {
		module.exports.cleanup();
	} );
}
