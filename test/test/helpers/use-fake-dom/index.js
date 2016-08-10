import debug from 'debug';

import reactTestEnvSetup from 'react-test-env';

const log = debug( 'calypso:test:helpers:setup-dom-env' );

export default function useFakedDom( markup, features ) {
	before( function setupFakeDom() {
		log( 'setting up dom env' );
		reactTestEnvSetup( markup, features );
	} );

	after( function cleanupFakeDom() {
		log( 'cleaning dom env' );
		reactTestEnvSetup.cleanup();

		// While it may not be the case that `page` is loaded in the context of
		// a DOM-dependent test, if it is, we must ensure that it's uncached
		// after the test finishes, since it stores a reference to the document
		// at the time of module load which will no longer exist after the
		// document is destroyed.
		delete require.cache[ require.resolve( 'page' ) ];
	} );
}

useFakedDom.withContainer = reactTestEnvSetup.useFakeDom.withContainer;
useFakedDom.getContainer = reactTestEnvSetup.useFakeDom.getContainer;
