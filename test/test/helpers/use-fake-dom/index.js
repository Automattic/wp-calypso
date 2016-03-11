import debug from 'debug';

import reactTestEnvSetup from 'lib/react-test-env-setup';

const log = debug( 'calypso:test:helpers:setup-dom-env' );

export default function( markup, features ) {
	before( function setupFakeDom() {
		log( 'setting up dom env' );
		reactTestEnvSetup( markup, features );
	} );

	after( function cleanupFakeDom() {
		log( 'cleaning dom env' );
		reactTestEnvSetup.cleanup();
	} );
}
