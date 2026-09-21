import { isEnabled } from '@automattic/calypso-config';
import { useMemo } from 'react';

const ENABLED_ROUTES: RegExp[] = [ /^\/sites\/[^/]+\/?$/ ];

export function shouldLoadAgentsManager( currentRoute?: string | null ): boolean {
	return (
		isEnabled( 'calypso/agents-manager' ) &&
		!! currentRoute &&
		ENABLED_ROUTES.some( ( route ) => route.test( currentRoute ) )
	);
}

export default function useShouldLoadAgentsManager( currentRoute?: string | null ): boolean {
	return useMemo( () => shouldLoadAgentsManager( currentRoute ), [ currentRoute ] );
}
