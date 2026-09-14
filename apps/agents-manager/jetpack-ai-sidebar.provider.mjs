/**
 * ESM provider wrapper for the Jetpack AI sidebar.
 *
 * The IIFE bundle (jetpack-ai-sidebar.min.js) assigns exports to
 * window.__JetpackAIProvider. This thin ESM re-exports them so
 * Agents Manager can load the provider via dynamic import().
 *
 * Uses a lazy proxy so exports resolve at access time, not at module
 * evaluation time. This avoids a race if AM imports this module
 * before the IIFE has executed.
 */
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
