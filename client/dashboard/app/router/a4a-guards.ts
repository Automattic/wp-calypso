import { agencyQuery, queryClient } from '@automattic/api-queries';
import { redirectAsNotAllowed } from './redirect';

/**
 * Builds a route `beforeLoad` guard that keeps the A4A agency and client
 * surfaces separated by user type: agency-only routes block client users, and
 * client-only routes block agency users, redirecting each to their own home.
 *
 * `agencyQuery` is primed by the root route's `beforeLoad`, so this resolves
 * from cache.
 */
function createAgencyAccessGuard( {
	allow,
	redirectTo,
}: {
	allow: 'agency' | 'client';
	redirectTo: string;
} ) {
	return async ( { cause }: { cause?: string } ) => {
		// Preloads (hover/intent) shouldn't trigger redirects.
		if ( cause === 'preload' ) {
			return;
		}

		const agency = await queryClient.ensureQueryData( agencyQuery() );
		const allowed = allow === 'client' ? agency.isClientUser : ! agency.isClientUser;
		if ( ! allowed ) {
			throw redirectAsNotAllowed( { to: redirectTo } );
		}
	};
}

// Agency-only routes: block A4A client users, sending them to their home.
export const requireAgencyUser = createAgencyAccessGuard( {
	allow: 'agency',
	redirectTo: '/client/subscriptions',
} );

// Client-only routes: block A4A agency users, sending them to their home.
export const requireClientUser = createAgencyAccessGuard( {
	allow: 'client',
	redirectTo: '/overview',
} );
