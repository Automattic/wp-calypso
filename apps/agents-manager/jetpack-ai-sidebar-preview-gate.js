/* global agentsManagerData */

/**
 * Temporary kill switch for the Jetpack AI Sidebar preview.
 *
 * Jetpack can mount this post-editor surface before the server-side AI
 * Assistant setting gate is available everywhere. This widgets.wp.com
 * entrypoint ships faster, so it filters the preview provider client-side.
 *
 * Remove once released Jetpack versions honor the AI Assistant setting.
 */

const JETPACK_AI_SIDEBAR_PROVIDER_FILE = 'jetpack-ai-sidebar.provider.mjs';

/**
 * Gate the Jetpack AI Sidebar preview on all site types.
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

	const providers = Array.isArray( data.agentProviders ) ? data.agentProviders : [];
	const remaining = providers.filter(
		( provider ) =>
			! ( typeof provider === 'string' && provider.includes( JETPACK_AI_SIDEBAR_PROVIDER_FILE ) )
	);
	data.agentProviders = remaining;

	// Mount only when another provider (Block Notes, Big Sky, etc.) still needs AM.
	return remaining.length === 0;
}
