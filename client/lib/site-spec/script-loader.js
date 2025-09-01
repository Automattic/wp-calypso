import debugFactory from 'debug';
import { getSiteSpecUrl } from './utils';

const debug = debugFactory( 'calypso:site-spec:script-loader' );

let siteSpecScriptLoaded = false;

/**
 * Check if the SiteSpec script is already loaded.
 */
export function isSiteSpecScriptLoaded() {
	return siteSpecScriptLoaded || !! document.querySelector( 'script[src*="site-spec"]' );
}

/**
 * Load the SiteSpec script.
 */
export function loadSiteSpecScript() {
	if ( siteSpecScriptLoaded ) {
		debug( 'SiteSpec script already loaded' );
		return Promise.resolve();
	}

	const scriptUrl = getSiteSpecUrl();
	debug( 'loadSiteSpecScript called with URL:', scriptUrl );

	if ( ! scriptUrl ) {
		const error = new Error( 'SiteSpec not enabled or URL not configured' );
		debug( 'Not loading SiteSpec script:', error.message );
		return Promise.reject( error );
	}

	// Check if script is already in DOM
	if ( document.querySelector( `script[src="${ scriptUrl }"]` ) ) {
		debug( 'SiteSpec script already in DOM' );
		siteSpecScriptLoaded = true;
		return Promise.resolve();
	}

	debug( `Loading SiteSpec script from "${ scriptUrl }"` );

	return new Promise( ( resolve, reject ) => {
		const script = document.createElement( 'script' );
		script.src = scriptUrl;
		script.type = 'text/javascript';
		script.id = 'site-spec-script';
		script.async = true;

		script.onload = () => {
			debug( 'SiteSpec script loaded successfully' );
			siteSpecScriptLoaded = true;
			resolve();
		};

		script.onerror = () => {
			const error = new Error( `Failed to load SiteSpec script from ${ scriptUrl }` );
			debug( 'Error loading SiteSpec script:', error.message );
			reject( error );
		};

		document.head.appendChild( script );
	} );
}

/**
 * Reset the internal script loading state.
 * Useful for testing or when you need to reload the script.
 */
export function resetSiteSpecScriptState() {
	siteSpecScriptLoaded = false;
}
