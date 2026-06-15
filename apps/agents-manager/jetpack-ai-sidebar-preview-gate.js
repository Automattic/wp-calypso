/* global agentsManagerData */

/**
 * Temporary kill switch for the Jetpack AI Sidebar preview.
 *
 * Jetpack can mount this post-editor surface on Atomic/self-hosted sites
 * before the server-side AI Assistant setting gate is available everywhere.
 * This widgets.wp.com entrypoint ships faster, so it filters the preview
 * provider client-side.
 *
 * Simple sites keep using wpcom's server-side gate and pass through untouched.
 *
 * Remove once released Jetpack versions honor the AI Assistant setting.
 */

const JETPACK_AI_SIDEBAR_PROVIDER_FILE = 'jetpack-ai-sidebar.provider.mjs';

/**
 * Gate the Jetpack AI Sidebar preview on non-Simple sites.
 *
 * Removes the Jetpack AI Sidebar provider from
 * `agentsManagerData.agentProviders`, which Agents Manager's
 * `loadExternalProviders()` reads later.
 * @returns {boolean} True when Agents Manager should not mount at all —
 *                    the preview was the only reason it was loaded.
 */
export function shouldSuppressJetpackAiSidebarPreview() {
	const data = typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;

	// Not a preview-driven mount (e.g. Block Notes without the preview).
	if ( ! data?.jetpackAiSidebarPreview ) {
		return false;
	}

	// wpcom owns the Simple-site gating server-side.
	if ( window._currentSiteType === 'simple' ) {
		return false;
	}

	const providers = Array.isArray( data.agentProviders ) ? data.agentProviders : [];
	const remaining = providers.filter(
		( provider ) =>
			! ( typeof provider === 'string' && provider.includes( JETPACK_AI_SIDEBAR_PROVIDER_FILE ) )
	);
	data.agentProviders = remaining;

	// Mount only when another provider (Block Notes, Big Sky, …) still needs AM.
	return remaining.length === 0;
}
