import { isEnabled } from '@automattic/calypso-config';
import { useMemo } from 'react';

const ENABLED_ROUTES: RegExp[] = [ /^\/sites\/[^/]+\/?$/ ];

export function shouldLoadAgentsManager( pathname: string ): boolean {
	return (
		isEnabled( 'calypso/agents-manager' ) &&
		ENABLED_ROUTES.some( ( route ) => route.test( pathname ) )
	);
}

export default function useShouldLoadAgentsManager( pathname: string ): boolean {
	return useMemo( () => shouldLoadAgentsManager( pathname ), [ pathname ] );
}
