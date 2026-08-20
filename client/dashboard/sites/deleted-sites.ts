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

// Returns `undefined` while the deleted-sites check is unresolved. The sites
// route loader prefetches the check for zero-site users, so in practice this
// settles before first paint.
export function useHasOnlyDeletedSites(): boolean | undefined {
	const { user } = useAuth();
	const { queries } = useAppContext();
	const noLiveSites = hasNoLiveSites( user );

	const { data, isPending } = useQuery( {
		...queries.paginatedSitesQuery( deletedSitesCheckFetchOptions ),
		enabled: noLiveSites,
	} );

	if ( ! noLiveSites ) {
		return false;
	}

	if ( isPending ) {
		return undefined;
	}

	return ( data?.total ?? 0 ) > 0;
}
