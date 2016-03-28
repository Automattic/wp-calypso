import debug from 'debug';

import reactTestEnvSetup from 'lib/react-test-env-setup';

const log = debug( 'calypso:test:helpers:setup-dom-env' );

export default function domWrapper( markup, features ) {
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
}

domWrapper.getContainer = function getContainer() {
	return document.getElementById( 'container' );
}
