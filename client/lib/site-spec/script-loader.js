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
	debug( '🔍 loadSiteSpecScript called' );

	if ( siteSpecScriptLoaded ) {
		debug( 'SiteSpec script already loaded' );
		return Promise.resolve();
	}

	const scriptUrl = getSiteSpecUrl();
	debug( 'loadSiteSpecScript called with URL:', scriptUrl );

	if ( ! scriptUrl ) {
		const error = new Error( 'SiteSpec not enabled or URL not configured' );
		debug( '❌ Not loading SiteSpec script:', error.message );
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
		// Load CSS first
		const cssUrl = scriptUrl.replace( 'sitespec.umd.js', 'style.css' );
		debug( `Loading SiteSpec CSS from "${ cssUrl }"` );

		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.href = cssUrl;
		link.id = 'site-spec-styles';

		link.onload = () => {
			debug( 'SiteSpec CSS loaded successfully' );

			// After CSS loads, load the script
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
		};

		link.onerror = () => {
			debug( 'Warning: Failed to load SiteSpec CSS from', cssUrl );
			// Continue with script loading even if CSS fails
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
		};

		document.head.appendChild( link );
	} );
}

/**
 * Reset the internal script loading state.
 * Useful for testing or when you need to reload the script.
 */
export function resetSiteSpecScriptState() {
	siteSpecScriptLoaded = false;
}
