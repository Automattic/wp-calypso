/**
 * Woo AI agent identification helper.
 *
 * The Woo AI admin assistant mounts AgentsManager via Jetpack with a
 * host-customized empty view: a time-aware, Score-informed greeting injected
 * server-side into `agentsManagerData` (`emptyViewHeading` / `emptyViewHelp`).
 */

/**
 * True if the current host is the Woo AI admin assistant.
 *
 * Detected from `sectionName` (Woo sets `wooai-admin` via the
 * `agents_manager_section_name` filter). Unlike reader-chat / plugin-compass,
 * Woo AI admin assistant is injected by Jetpack's Agents Manager feature, which
 * injects a bare `const agentsManagerData` global rather than a `window` property.
 * so we read the bare global first and fall back to `window.agentsManagerData`.
 */
export function isWooAiHost(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const data =
		typeof agentsManagerData !== 'undefined' && agentsManagerData
			? ( agentsManagerData as unknown as { sectionName?: string } )
			: ( window as unknown as { agentsManagerData?: { sectionName?: string } } ).agentsManagerData;

	const sectionName = data?.sectionName;
	return typeof sectionName === 'string' && sectionName.startsWith( 'wooai' );
}
