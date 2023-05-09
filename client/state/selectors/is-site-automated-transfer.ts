import type { AppState } from 'calypso/types';
/**
 * Returns true if site is a Automated Transfer site, false if not and null if unknown
 */
export default function isSiteAutomatedTransfer(
	state: AppState,
	siteId: number | undefined | null
): boolean | null {
	if ( ! siteId ) {
		return null;
	}
	return state?.sites?.items?.[ siteId ]?.options?.is_automated_transfer ?? null;
}
