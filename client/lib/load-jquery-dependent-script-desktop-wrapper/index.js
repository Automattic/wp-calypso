/**
 * A wrapper for loadjQueryDependentScript that handles the desktop app
 * It is not possible to expose jQuery globally in Electron App: https://github.com/atom/electron/issues/254.
 * It needs to be loaded using require and npm package.
 */

/**
 * External dependencies
 */
import { loadScript, loadjQueryDependentScript } from '@automattic/load-script';
import config from 'config';
import debugFactory from 'debug';
const debug = debugFactory( 'lib/load-jquery-dependent-script-desktop-wrapper' );

export function loadjQueryDependentScriptDesktopWrapper( url, callback ) {
	debug( `Loading a jQuery dependent script from "${ url }"` );

	// It is not possible to expose jQuery globally in Electron App: https://github.com/atom/electron/issues/254.
	// It needs to be loaded using require and npm package.
	if ( config.isEnabled( 'desktop' ) ) {
		debug( `Attaching jQuery from node_modules to window for "${ url }"` );
		asyncRequire( 'jquery', ( $ ) => {
			window.$ = window.jQuery = $;
			loadScript( url, callback );
		} );
		return;
	}

	loadjQueryDependentScript( url, callback );
}
