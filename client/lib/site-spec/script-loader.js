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
		// Load CSS first - handle both .umd.js and .bundle.umd.js
		let cssUrl;
		if ( scriptUrl.includes( 'sitespec.bundle.umd.js' ) ) {
			cssUrl = scriptUrl.replace( 'sitespec.bundle.umd.js', 'style.css' );
		} else if ( scriptUrl.includes( 'sitespec.umd.js' ) ) {
			cssUrl = scriptUrl.replace( 'sitespec.umd.js', 'style.css' );
		} else {
			// Fallback: assume CSS is in the same directory with style.css name
			cssUrl = scriptUrl.replace( /\/[^\/]+\.js$/, '/style.css' );
		}

		debug( `Loading SiteSpec CSS from "${ cssUrl }"` );

		// Check if CSS is already loaded
		if ( document.querySelector( `link[href="${ cssUrl }"]` ) ) {
			debug( 'SiteSpec CSS already loaded, proceeding with script' );
			loadScript();
			return;
		}

		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.href = cssUrl;
		link.id = 'site-spec-styles';

		link.onload = () => {
			debug( '✅ SiteSpec CSS loaded successfully' );
			loadScript();
		};

		link.onerror = () => {
			debug( '⚠️ Warning: Failed to load SiteSpec CSS from', cssUrl );
			debug( 'Continuing with script loading anyway...' );
			loadScript();
		};

		document.head.appendChild( link );

		function loadScript() {
			// After CSS loads (or fails), load the script
			const script = document.createElement( 'script' );
			script.src = scriptUrl;
			script.type = 'text/javascript';
			script.id = 'site-spec';
			script.async = true;

			script.onload = () => {
				debug( '✅ SiteSpec script loaded successfully' );
				siteSpecScriptLoaded = true;
				resolve();
			};

			script.onerror = () => {
				const error = new Error( `Failed to load SiteSpec script from ${ scriptUrl }` );
				debug( '❌ Error loading SiteSpec script:', error.message );
				reject( error );
			};

			document.head.appendChild( script );
		}
	} );
}

/**
 * Load SiteSpec CSS separately (useful for testing or manual loading)
 */
export function loadSiteSpecCSS() {
	const scriptUrl = getSiteSpecUrl();
	if ( ! scriptUrl ) {
		debug( 'Cannot load CSS: SiteSpec URL not configured' );
		return Promise.reject( new Error( 'SiteSpec URL not configured' ) );
	}

	// Handle both .umd.js and .bundle.umd.js
	let cssUrl;
	if ( scriptUrl.includes( 'sitespec.bundle.umd.js' ) ) {
		cssUrl = scriptUrl.replace( 'sitespec.bundle.umd.js', 'style.css' );
	} else if ( scriptUrl.includes( 'sitespec.umd.js' ) ) {
		cssUrl = scriptUrl.replace( 'sitespec.umd.js', 'style.css' );
	} else {
		cssUrl = scriptUrl.replace( /\/[^\/]+\.js$/, '/style.css' );
	}

	debug( `Loading SiteSpec CSS from "${ cssUrl }"` );

	// Check if CSS is already loaded
	if ( document.querySelector( `link[href="${ cssUrl }"]` ) ) {
		debug( 'SiteSpec CSS already loaded' );
		return Promise.resolve();
	}

	return new Promise( ( resolve, reject ) => {
		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.href = cssUrl;
		link.id = 'site-spec-styles';

		link.onload = () => {
			debug( '✅ SiteSpec CSS loaded successfully' );
			resolve();
		};

		link.onerror = () => {
			const error = new Error( `Failed to load SiteSpec CSS from ${ cssUrl }` );
			debug( '❌ Error loading SiteSpec CSS:', error.message );
			reject( error );
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
