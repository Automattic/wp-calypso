import config from '@automattic/calypso-config';
import { useMemo } from 'react';

const ENABLED_SECTIONS: string[] = [ 'home' ];

/**
 * Controls which Calypso sections load Agents Manager in the staging environment.
 */
export default function useShouldLoadAgentsManager( sectionName?: string | null ): boolean {
	return useMemo(
		() =>
			config.isEnabled( 'calypso/agents-manager' ) &&
			!! sectionName &&
			ENABLED_SECTIONS.includes( sectionName ),
		[ sectionName ]
	);
}
