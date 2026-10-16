import { fetchSiteAbilities } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteAbilitiesQuery = ( siteId: number, wpLocale?: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'abilities', wpLocale ],
		queryFn: () => fetchSiteAbilities( siteId, wpLocale ),
		// An unreachable or too-old site is an expected state; don't stall it with retries.
		retry: false,
	} );
