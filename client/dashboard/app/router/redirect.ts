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

/**
 * A `dashboardRedirect()` that also sets the `route-not-allowed` flash param,
 * so the destination can surface a "you don't have permission" snackbar (via a
 * `<FlashMessage id="route-not-allowed" />`). Use this whenever a `beforeLoad`
 * guard bounces a user away from a page they aren't allowed to access.
 */
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
