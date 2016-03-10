import debug from 'debug';

import reactTestEnvSetup from 'lib/react-test-env-setup';

const log = debug( 'calypso:test:helpers:setup-dom-env' );

export default function( markup, features ) {
	before( function() {
		log( 'setting up dom env' );
		reactTestEnvSetup( markup, features );
	} );

	after( function() {
		log( 'cleaning dom env' );
		reactTestEnvSetup.cleanup();
	} );
}
