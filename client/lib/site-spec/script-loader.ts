import { getSiteSpecUrl } from './utils';

let siteSpecScriptLoaded = false;
let scriptLoadPromise: Promise< void > | null = null;
let cssLoadPromise: Promise< void > | null = null;

export function isSiteSpecScriptLoaded() {
	const scriptUrl = getSiteSpecUrl();
	return (
		siteSpecScriptLoaded ||
		( !! scriptUrl && !! document.querySelector( `script[src="${ scriptUrl }"]` ) )
	);
}

export async function loadSiteSpecScript( opts: { withCss?: boolean } = {} ) {
	const { withCss = true } = opts;

	if ( siteSpecScriptLoaded ) {
		return;
	}
	if ( scriptLoadPromise ) {
		return scriptLoadPromise;
	}

	const scriptUrl = getSiteSpecUrl();
	if ( ! scriptUrl ) {
		throw new Error( 'SiteSpec not enabled or URL not configured' );
	}

	scriptLoadPromise = ( async () => {
		// Load CSS first, if configured
		if ( withCss ) {
			await loadSiteSpecCSS().catch( () => {
				// Don’t block script on CSS failure
			} );
		}

		// Already present in DOM?
		if ( document.querySelector( `script[src="${ scriptUrl }"]` ) ) {
			siteSpecScriptLoaded = true;
			return;
		}

		await injectScript( scriptUrl );
		siteSpecScriptLoaded = true;
	} )();

	try {
		await scriptLoadPromise;
	} finally {
		scriptLoadPromise = null;
	}
}

export function loadSiteSpecCSS(): Promise< void > {
	const cssUrl = getSiteSpecUrl( 'css_url' );
	if ( ! cssUrl ) {
		return Promise.reject( new Error( 'SiteSpec CSS URL not configured' ) );
	}

	// Already present?
	if ( document.querySelector( `link[href="${ cssUrl }"]` ) ) {
		return Promise.resolve();
	}

	// Already loading?
	if ( cssLoadPromise ) {
		return cssLoadPromise;
	}

	cssLoadPromise = injectCss( cssUrl ).finally( () => {
		cssLoadPromise = null;
	} );
	return cssLoadPromise;
}

export function resetSiteSpecScriptState() {
	siteSpecScriptLoaded = false;
	scriptLoadPromise = null;
	cssLoadPromise = null;
	// Note: DOM nodes (script/link) are left in place intentionally.
}

/* ------- tiny internal helpers ------- */

function injectScript( url: string ): Promise< void > {
	return new Promise( ( resolve, reject ) => {
		const el = document.createElement( 'script' );
		el.src = url;
		el.type = 'text/javascript';
		el.id = 'site-spec';
		el.async = true;
		el.onload = () => resolve();
		el.onerror = () => reject( new Error( `Failed to load SiteSpec script from ${ url }` ) );
		document.head.appendChild( el );
	} );
}

function injectCss( url: string ): Promise< void > {
	return new Promise( ( resolve, reject ) => {
		const el = document.createElement( 'link' );
		el.rel = 'stylesheet';
		el.href = url;
		el.id = 'site-spec-styles';
		el.onload = () => resolve();
		el.onerror = () => reject( new Error( `Failed to load SiteSpec CSS from ${ url }` ) );
		document.head.appendChild( el );
	} );
}
