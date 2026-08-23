import { hasStagingSitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../app/auth';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import { userHasNoLiveSites } from '../utils/user';

// Returns `undefined` while the staging-sites check is unresolved. The sites
// route loader prefetches the check for zero-site users, so in practice it
// settles before first paint.
export function useHasOnlyStagingSites( isListEmpty: boolean ): boolean | undefined {
	const { user } = useAuth();
	const enabled = ! isDashboardBackport() && ( userHasNoLiveSites( user ) || isListEmpty );

	const { data, isPending } = useQuery( {
		...hasStagingSitesQuery(),
		enabled,
	} );

	if ( ! enabled ) {
		return false;
	}

	if ( isPending ) {
		return undefined;
	}

	return data ?? false;
}
