/**
 * Load the wpcom fit.js into the outer document so
 * `window.applyA4aFit(shadowRoot)` is callable from the agent-studio
 * preview. Backed by the dedicated `/wpcom/v2/a4a/fit-script` endpoint
 * — separate from the deck render path, so a single cache key controls
 * freshness and a stale deck can't pin the fitter to an old version.
 *
 * Singleton: returns the same Promise across all callers in one tab so
 * the script is fetched/evaluated exactly once per session. The Promise
 * resolves when `window.applyA4aFit` becomes available (the script's
 * IIFE registers it).
 */
declare global {
	interface Window {
		applyA4aFit?: ( root: Document | ShadowRoot ) => Promise< void >;
	}
}

const FIT_SCRIPT_URL = 'https://public-api.wordpress.com/wpcom/v2/a4a/fit-script';

let loadPromise: Promise< boolean > | null = null;

export function loadFitScript(): Promise< boolean > {
	if ( typeof window === 'undefined' ) {
		return Promise.resolve( false );
	}
	if ( window.applyA4aFit ) {
		return Promise.resolve( true );
	}
	if ( loadPromise ) {
		return loadPromise;
	}
	loadPromise = new Promise< boolean >( ( resolve ) => {
		const url = `${ FIT_SCRIPT_URL }?_t=${ Date.now() }`;
		const s = document.createElement( 'script' );
		s.src = url;
		s.async = true;
		s.dataset.a4aFit = '1';
		s.onload = () => resolve( !! window.applyA4aFit );
		s.onerror = () => {
			loadPromise = null; // allow retries on transient failure
			resolve( false );
		};
		document.head.appendChild( s );
	} );
	return loadPromise;
}
