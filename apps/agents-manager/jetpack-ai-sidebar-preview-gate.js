/* global agentsManagerData */

/**
 * Temporary kill switch for the legacy `jetpackAiSidebarPreview` era of the
 * Jetpack AI Sidebar.
 *
 * The sidebar itself is unchanged; only the contract is. New, toggle-respecting
 * Jetpack advertises the `jetpackAiSidebar` payload and honours the AI Assistant
 * setting server-side, so it is left to mount. Older releases (the legacy
 * `jetpackAiSidebarPreview` marker — i.e. no `jetpackAiSidebar`) registered the
 * provider without that gate, so on non-Simple sites we drop just the Jetpack
 * provider and let the rest (Big Sky, …) mount. Simple is always gated
 * server-side by wpcom.
 *
 * Remove once legacy Jetpack releases age out.
 */

const JETPACK_AI_SIDEBAR_PROVIDER_FILE = 'jetpack-ai-sidebar.provider.mjs';

function getProviderUrl( provider ) {
	if ( typeof provider === 'string' ) {
		return provider;
	}

	if ( provider && typeof provider === 'object' && typeof provider.url === 'string' ) {
		return provider.url;
	}

	return '';
}

/**
 * @returns {boolean} True when Agents Manager should not mount at all — the legacy
 *                    Jetpack sidebar was the only provider.
 */
export function shouldSuppressJetpackAiSidebarPreview() {
	const data = typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;

	// New Jetpack (emits `jetpackAiSidebar`) honours the setting itself; Simple is
	// gated server-side by wpcom. Either way, nothing to gate here.
	if ( ! data || data.jetpackAiSidebar || window._currentSiteType === 'simple' ) {
		return false;
	}

	// Legacy Jetpack: drop only its provider, keep the rest.
	const providers = Array.isArray( data.agentProviders ) ? data.agentProviders : [];
	const remaining = providers.filter(
		( provider ) => ! getProviderUrl( provider ).includes( JETPACK_AI_SIDEBAR_PROVIDER_FILE )
	);
	data.agentProviders = remaining;

	// Mount only when another provider (Block Notes, Big Sky, …) still needs AM.
	return remaining.length === 0;
}
