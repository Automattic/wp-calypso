import { isAutomatticianQuery, readTeamsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery, type QueryClient } from '@tanstack/react-query';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

/**
 * Whether Save to read later is on for the current user: for everyone once the
 * `reader/saved-posts` flag is on, and for Automatticians until then.
 */
export function useIsSavedPostsEnabled(): boolean {
	const isLaunched = isEnabled( 'reader/saved-posts' );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { data: isAutomattician = false } = useQuery( {
		...isAutomatticianQuery(),
		enabled: isLoggedIn && ! isLaunched,
	} );

	return isLaunched || isAutomattician;
}

/**
 * `useIsSavedPostsEnabled()` for route handlers. Loads the user's teams if they
 * aren't cached, and treats a failed request as not an Automattician.
 */
export async function isSavedPostsEnabled( queryClient: QueryClient ): Promise< boolean > {
	if ( isEnabled( 'reader/saved-posts' ) ) {
		return true;
	}

	try {
		const { teams } = await queryClient.fetchQuery( readTeamsQuery() );
		return isAutomatticTeamMember( teams );
	} catch {
		return false;
	}
}
