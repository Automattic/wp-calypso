// eslint-disable-next-line no-restricted-imports
import { redirect } from '@tanstack/react-router';

/**
 * A wrapper around TanStack Router's `redirect()` that disables view transitions.
 * Redirects are automatic reroutes, not user-initiated navigations, so they
 * should not trigger a view transition animation.
 */
export function dashboardRedirect(
	...args: Parameters< typeof redirect >
): ReturnType< typeof redirect > {
	const [ options ] = args;
	return redirect( { ...options, viewTransition: false } );
}
