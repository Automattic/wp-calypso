// eslint-disable-next-line no-restricted-imports
import { redirect } from '@tanstack/react-router';

/**
 * A wrapper around TanStack Router's `redirect()` that disables view transitions.
 * Redirects are automatic reroutes, not user-initiated navigations, so they
 * should not trigger a view transition animation.
 */
export function dashboardRedirect(
	options: Parameters< typeof redirect >[ 0 ]
): ReturnType< typeof redirect > {
	return redirect( { ...options, viewTransition: false } );
}
