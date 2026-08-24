// eslint-disable-next-line no-restricted-imports
import { redirect } from '@tanstack/react-router';

/**
 * A wrapper around TanStack Router's `redirect()` that disables view transitions.
 * Redirects are automatic reroutes, not user-initiated navigations, so they
 * should not trigger a view transition animation.
 *
 * Typed as `typeof redirect` so callers get the same generic inference for
 * `to`, `params`, and `search` as the underlying function.
 */
export const dashboardRedirect: typeof redirect = ( options ) =>
	redirect( { ...options, viewTransition: false } );

export function redirectAsNotAllowed( options: {
	to: string;
	params?: Record< string, string >;
	search?: Record< string, unknown >;
} ) {
	return dashboardRedirect( {
		...options,
		search: {
			...options.search,
			flash: 'route-not-allowed',
		},
	} );
}
