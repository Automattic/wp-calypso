/**
 * External dependencies
 */
import debugModule from 'debug';

// This module is run at page startup when support user is active. It performs
// any pre-Calypso-boot initialization that is required by support user. Once
// the pre-boot completes, it loads the main Calypso bundles passed in via
// `window.supportUser.readyScripts`.

const debug = debugModule( 'calypso:support-user' );

const loadScript = ( script, callback ) => {
	var bundle = document.createElement( 'script' );
	bundle.onload = callback;
	bundle.src = script;
	document.body.appendChild( bundle )
}

const bootCalypso = () => {
	if ( ! window.supportUser || !window.supportUser.readyScripts ) {
		console.error( 'supportUserReady scripts not specified' );
	}

	const readyScripts = window.supportUser.readyScripts;

	let loadedScripts = 0;
	readyScripts.forEach( ( script ) => {
		debug( 'Booting Calypso bundle', window.supportUserReady );

		loadScript( script, () => {
			loadedScripts++;

			// Boot Calypso when all scripts have loaded
			if ( loadedScripts === readyScripts.length ) {
				window.AppBoot();
			}
		} );
	} );
}

debug( 'Support user preboot', window.supportUserReady );
// Do any support user asynchronous pre-boot tasks before calling bootCalypso.
// This is where localforage.defineDriver will be called in future.
bootCalypso();
