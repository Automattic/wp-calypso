import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import type { FetchPaginatedSitesOptions, User } from '@automattic/api-core';

export const deletedSitesCheckFetchOptions: FetchPaginatedSitesOptions = {
	site_visibility: 'deleted',
	include_a8c_owned: false,
	per_page: 1,
};

export function hasNoLiveSites( user: User | undefined ): boolean {
	return user?.site_count === 0;
}

export function useHasOnlyDeletedSites() {
	const { user } = useAuth();
	const { queries } = useAppContext();
	const noLiveSites = hasNoLiveSites( user );

	// Holds the full-page loader so the onboarding empty state never
	// flashes before the deleted-aware one.
	const { data } = useQuery( {
		...queries.paginatedSitesQuery( deletedSitesCheckFetchOptions ),
		enabled: noLiveSites,
		meta: { fullPageLoader: true },
	} );

	return noLiveSites && ( data?.total ?? 0 ) > 0;
}
