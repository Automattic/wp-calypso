import config from '@automattic/calypso-config';
import { useMemo } from 'react';

const ENABLED_ROUTES: RegExp[] = [ /^\/sites\/[^/]+\/?$/ ];

/**
 * Controls which Calypso routes load Agents Manager in enabled environments.
 */
export default function useShouldLoadAgentsManager(
	sectionName?: string | null,
	currentRoute?: string | null
): boolean {
	return useMemo(
		() =>
			config.isEnabled( 'calypso/agents-manager' ) &&
			sectionName === 'sites-dashboard' &&
			!! currentRoute &&
			ENABLED_ROUTES.some( ( route ) => route.test( currentRoute ) ),
		[ currentRoute, sectionName ]
	);
}
