import { useMemo } from 'react';

const ENABLED_SECTIONS: string[] = [ 'home' ];

/**
 * Controls which Calypso sections load Agents Manager while the integration is developed.
 * Clear `ENABLED_SECTIONS` before shipping the production bundle.
 */
export default function useShouldLoadAgentsManager( sectionName?: string | null ): boolean {
	return useMemo(
		() => !! sectionName && ENABLED_SECTIONS.includes( sectionName ),
		[ sectionName ]
	);
}
