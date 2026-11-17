import { BusinessPlans, EcommercePlans } from '@automattic/api-core';
import { fetchIsAutomattician, isAutomatticianQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';

export function hasBackendAccess( productSlug: string | undefined ) {
	if ( ! productSlug ) {
		return false;
	}
	return (
		( BusinessPlans as readonly string[] ).includes( productSlug ) ||
		( EcommercePlans as readonly string[] ).includes( productSlug )
	);
}

// The APM endpoints only answer Automatticians for now (`get_apm_permissions_check` in wpcom).
// Everyone else is kept out of the APM views instead of reaching requests that are refused.
// Remove this gate together with the server-side one.

/**
 * Whether to show the APM views (Server response and its settings). Pages that render this
 * settle it first with `prefetchApmAccess()` in their route loader, so nothing pops in. An
 * unknown or failed lookup hides the views.
 */
export function useCanViewApm() {
	const apmEnabled = isEnabled( 'performance/apm' );
	const { data: isAutomattician } = useQuery( {
		...isAutomatticianQuery(),
		enabled: apmEnabled,
	} );
	return apmEnabled && isAutomattician === true;
}

/**
 * The same decision as `useCanViewApm()`, for route `beforeLoad` and loaders. Never throws: an
 * error thrown from `beforeLoad` would leave the routes below it pending.
 */
export async function canViewApm() {
	if ( ! isEnabled( 'performance/apm' ) ) {
		return false;
	}
	try {
		return await fetchIsAutomattician();
	} catch {
		return false;
	}
}

export async function prefetchApmAccess() {
	await canViewApm();
}
