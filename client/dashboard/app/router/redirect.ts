import { fetchTwoStep } from '@automattic/api-core';
// eslint-disable-next-line no-restricted-imports
import { redirect } from '@tanstack/react-router';
import { reauthRequiredLink } from '../../utils/link';
import type { TwoStep } from '@automattic/api-core';

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

/**
 * Throws a redirect to reauthorization when the session's two-step login has expired.
 *
 * A failed check is ignored rather than thrown: from a `beforeLoad`, an error leaves every route
 * below that one pending, and the router never settles to show an error screen. The check is only
 * a shortcut to reauthorization, so the routes are left to report their own errors.
 */
export async function redirectIfTwoStepReauthRequired() {
	let twoStep: TwoStep;
	try {
		twoStep = await fetchTwoStep();
	} catch {
		return;
	}

	if ( twoStep.two_step_reauthorization_required ) {
		throw dashboardRedirect( { href: reauthRequiredLink(), reloadDocument: true } );
	}
}
