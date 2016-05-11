var log = require( 'debug' )( 'test:helpers:setup-dom-env' ),
	reactTestEnvSetup = require( '../react-test-env-setup' );

function domWrapper( markup, features ) {
	before( function setupFakeDom() {
		log( 'setting up dom env' );
		reactTestEnvSetup( markup, features );
	} );

	after( function cleanupFakeDom() {
		log( 'cleaning dom env' );
		reactTestEnvSetup.cleanup();
	} );
}

domWrapper.withContainer = function withContainer() {
	domWrapper( '<html><head><title>test</title></head><body><div id="container"></div></body></html>' );
};

domWrapper.getContainer = function getContainer() {
	return document.getElementById( 'container' );
};

module.exports = domWrapper;
