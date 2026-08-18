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

	// Prefetched by the sitesRoute loader for zero-site users, so the
	// deleted-aware empty state renders without a flash of onboarding copy.
	const { data } = useQuery( {
		...queries.paginatedSitesQuery( deletedSitesCheckFetchOptions ),
		enabled: noLiveSites,
	} );

	return noLiveSites && ( data?.total ?? 0 ) > 0;
}
