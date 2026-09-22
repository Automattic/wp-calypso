import { hasDeletedSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../app/auth';
import { userHasNoLiveSites } from '../utils/user';

// Returns `undefined` while the deleted-sites check is unresolved. The sites
// route loader prefetches the check for zero-site users, so in practice this
// settles before first paint.
export function useHasOnlyDeletedSites(): boolean | undefined {
	const { user } = useAuth();
	const noLiveSites = userHasNoLiveSites( user );

	const { data, isPending } = useQuery( {
		...hasDeletedSitesQuery(),
		enabled: noLiveSites,
	} );

	if ( ! noLiveSites ) {
		return false;
	}

	if ( isPending ) {
		return undefined;
	}

	return data ?? false;
}
