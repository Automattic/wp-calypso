import { getSiteSpecUrl } from './utils';

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
		return Promise.resolve();
	}

	const scriptUrl = getSiteSpecUrl();

	if ( ! scriptUrl ) {
		const error = new Error( 'SiteSpec not enabled or URL not configured' );
		return Promise.reject( error );
	}

	// Check if script is already in DOM
	if ( document.querySelector( `script[src="${ scriptUrl }"]` ) ) {
		siteSpecScriptLoaded = true;
		return Promise.resolve();
	}

	return new Promise( ( resolve, reject ) => {
		// Load CSS first using configured CSS URL
		const cssUrl = getSiteSpecUrl( 'css_url' );
		if ( ! cssUrl ) {
			loadScript();
			return;
		}

		// Check if CSS is already loaded
		if ( document.querySelector( `link[href="${ cssUrl }"]` ) ) {
			loadScript();
			return;
		}

		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.href = cssUrl;
		link.id = 'site-spec-styles';

		link.onload = () => {
			loadScript();
		};

		link.onerror = () => {
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
				siteSpecScriptLoaded = true;
				resolve();
			};

			script.onerror = () => {
				const error = new Error( `Failed to load SiteSpec script from ${ scriptUrl }` );
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
	const cssUrl = getSiteSpecUrl( 'css_url' );
	if ( ! cssUrl ) {
		return Promise.reject( new Error( 'SiteSpec CSS URL not configured' ) );
	}

	// Check if CSS is already loaded
	if ( document.querySelector( `link[href="${ cssUrl }"]` ) ) {
		return Promise.resolve();
	}

	return new Promise( ( resolve, reject ) => {
		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.href = cssUrl;
		link.id = 'site-spec-styles';

		link.onload = () => {
			resolve();
		};

		link.onerror = () => {
			const error = new Error( `Failed to load SiteSpec CSS from ${ cssUrl }` );
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
