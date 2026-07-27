/**
 * ESM provider wrapper for the Jetpack AI sidebar.
 *
 * The IIFE bundle (jetpack-ai-sidebar.min.js) assigns exports to
 * window.__JetpackAIProvider. This thin ESM re-exports them so
 * Agents Manager can load the provider via dynamic import().
 *
 * When the host page has not already loaded the IIFE (Jetpack's eager
 * enqueue), this module loads it — and its stylesheet — on demand before
 * exporting, so hosts can defer the whole Jetpack AI provider bundle until
 * Agents Manager first imports the provider. Top-level await keeps the
 * dynamic import() pending until the IIFE has executed, and the sibling
 * URLs are derived from import.meta.url so the wrapper always loads the
 * bundle it was published with. No ?ver= is needed for the same reason.
 *
 * Uses a lazy proxy so exports resolve at access time, not at module
 * evaluation time. This avoids a race if AM imports this module before
 * the IIFE has executed, and keeps a failed on-demand load non-fatal:
 * exports resolve to undefined, exactly as they did when the IIFE never
 * ran.
 */

const loadProviderStylesheet = () => {
	// Jetpack's eager enqueue registers the stylesheet under this handle id;
	// when it is present the styles are already on the page.
	if ( document.getElementById( 'jetpack-ai-provider-css' ) ) {
		return;
	}
	const link = document.createElement( 'link' );
	link.id = 'jetpack-ai-provider-css';
	link.rel = 'stylesheet';
	link.href = new URL(
		'rtl' === document.documentElement.dir
			? './jetpack-ai-sidebar.rtl.css'
			: './jetpack-ai-sidebar.css',
		import.meta.url
	).href;
	document.head.appendChild( link );
};

const loadProviderBundle = () =>
	new Promise( ( resolve ) => {
		const script = document.createElement( 'script' );
		script.src = new URL( './jetpack-ai-sidebar.min.js', import.meta.url ).href;
		script.async = true;
		script.onload = resolve;
		// Non-fatal by design: on error the lazy proxies below keep resolving
		// to undefined, matching the pre-existing "IIFE never ran" behavior.
		script.onerror = resolve;
		document.head.appendChild( script );
	} );

if ( typeof window !== 'undefined' && ! window.__JetpackAIProvider ) {
	loadProviderStylesheet();
	await loadProviderBundle();
}

const lazy =
	( key ) =>
	( ...args ) => {
		const fn = window.__JetpackAIProvider?.[ key ];
		return typeof fn === 'function' ? fn( ...args ) : undefined;
	};

export const providerId = 'jetpack-ai-sidebar';
export const getChatComponent = lazy( 'getChatComponent' );
export const getEmptyViewSuggestions = lazy( 'getEmptyViewSuggestions' );
export const useSuggestions = lazy( 'useSuggestions' );
export const useAbilitiesSetup = lazy( 'useAbilitiesSetup' );
export const useCheckpoint = lazy( 'useCheckpoint' );

// toolProvider and contextProvider are objects, not functions — use getters.
export const toolProvider = new Proxy(
	{},
	{ get: ( _, prop ) => window.__JetpackAIProvider?.toolProvider?.[ prop ] }
);
export const contextProvider = new Proxy(
	{},
	{ get: ( _, prop ) => window.__JetpackAIProvider?.contextProvider?.[ prop ] }
);
// `capabilities` is a flat flag object (e.g. `{ supportsSplitScreen: true }`).
// Same lazy-proxy pattern so AM's `loadExternalProviders` sees it even if
// the IIFE hasn't yet assigned it when this ESM is first evaluated.
export const capabilities = new Proxy(
	{},
	{ get: ( _, prop ) => window.__JetpackAIProvider?.capabilities?.[ prop ] }
);
