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
const PROVIDER_READY_EVENT = 'jetpack-ai-sidebar-provider-ready';
const PROVIDER_READY_TIMEOUT_MS = 2000;
const PROVIDER_READY_POLL_MS = 50;

let providerReadyNotificationScheduled = false;

const isProviderGlobalReady = () => !! window.__JetpackAIProvider;

function dispatchProviderReady() {
	window.dispatchEvent( new Event( PROVIDER_READY_EVENT ) );
}

function scheduleProviderReadyNotification() {
	if ( providerReadyNotificationScheduled ) {
		return;
	}
	providerReadyNotificationScheduled = true;

	if ( isProviderGlobalReady() ) {
		dispatchProviderReady();
		return;
	}

	const startedAt = Date.now();
	const intervalId = window.setInterval( () => {
		if ( isProviderGlobalReady() ) {
			window.clearInterval( intervalId );
			dispatchProviderReady();
			return;
		}
		if ( Date.now() - startedAt > PROVIDER_READY_TIMEOUT_MS ) {
			window.clearInterval( intervalId );
			providerReadyNotificationScheduled = false;
		}
	}, PROVIDER_READY_POLL_MS );
}

function waitForProviderReady() {
	if ( isProviderGlobalReady() ) {
		return Promise.resolve();
	}

	return new Promise( ( resolve ) => {
		const startedAt = Date.now();
		const intervalId = window.setInterval( () => {
			if ( isProviderGlobalReady() || Date.now() - startedAt > PROVIDER_READY_TIMEOUT_MS ) {
				window.clearInterval( intervalId );
				resolve();
			}
		}, PROVIDER_READY_POLL_MS );
	} );
}

const fallbackToolProvider = {
	getAbilities: async () => {
		await waitForProviderReady();
		return window.__JetpackAIProvider?.toolProvider?.getAbilities?.() ?? [];
	},
	executeAbility: async ( ...args ) => {
		await waitForProviderReady();
		const executeAbility = window.__JetpackAIProvider?.toolProvider?.executeAbility;
		if ( typeof executeAbility === 'function' ) {
			return executeAbility( ...args );
		}
		return {
			result: { error: 'Jetpack AI provider is not ready.' },
			returnToAgent: false,
		};
	},
};

const fallbackContextProvider = {
	getClientContext: () => ( {} ),
};

const lazy =
	( key, fallback ) =>
	( ...args ) => {
		const fn = window.__JetpackAIProvider?.[ key ];
		if ( typeof fn !== 'function' ) {
			scheduleProviderReadyNotification();
		}
		return typeof fn === 'function' ? fn( ...args ) : fallback;
	};

export const getChatComponent = lazy( 'getChatComponent', null );
export const getEmptyViewSuggestions = lazy( 'getEmptyViewSuggestions', [] );
export const useSuggestions = lazy( 'useSuggestions', { suggestions: [] } );
export const useAbilitiesSetup = lazy( 'useAbilitiesSetup' );
export const useCheckpoint = lazy( 'useCheckpoint' );
export const isProviderReady = isProviderGlobalReady;

// toolProvider and contextProvider are objects, not functions — use getters.
export const toolProvider = new Proxy(
	{},
	{
		get: ( _, prop ) =>
			window.__JetpackAIProvider?.toolProvider?.[ prop ] ?? fallbackToolProvider[ prop ],
	}
);
export const contextProvider = new Proxy(
	{},
	{
		get: ( _, prop ) =>
			window.__JetpackAIProvider?.contextProvider?.[ prop ] ?? fallbackContextProvider[ prop ],
	}
);
// `capabilities` is a flat flag object (e.g. `{ supportsSplitScreen: true }`).
// Same lazy-proxy pattern so AM's `loadExternalProviders` sees it even if
// the IIFE hasn't yet assigned it when this ESM is first evaluated.
export const capabilities = new Proxy(
	{},
	{ get: ( _, prop ) => window.__JetpackAIProvider?.capabilities?.[ prop ] }
);
