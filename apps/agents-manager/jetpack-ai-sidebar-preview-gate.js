/* global agentsManagerData */

/**
 * Stopgap kill switch for the Jetpack AI Sidebar preview.
 *
 * Jetpack 15.9 enables the AI Sidebar preview by default in the post editor
 * with no kill switch on Atomic and self-hosted sites (AI-993): the "Ask AI"
 * dock renders even when the site's AI Assistant setting is off. The PHP fix
 * (Automattic/jetpack#49489) needs a plugin release, while this bundle ships
 * straight from widgets.wp.com — so the gate lives here, in the one entry
 * point Jetpack 15.9 mounts in the post editor.
 *
 * Simple sites are gated server-side by wpcom (D222450) and pass through
 * untouched: gutenberg-wpcom sets `window._currentSiteType = 'simple'` on
 * every Simple-site editor.
 *
 * Remove once Jetpack releases honoring the AI Assistant setting have
 * rolled out to most sites.
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
