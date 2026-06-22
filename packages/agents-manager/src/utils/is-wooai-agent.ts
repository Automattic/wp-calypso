import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';

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
 * `agents_manager_section_name` filter).
 */
export function isWooAiHost(): boolean {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	const sectionName = getAgentsManagerInlineData()?.sectionName;
	return typeof sectionName === 'string' && sectionName.startsWith( 'wooai' );
}
