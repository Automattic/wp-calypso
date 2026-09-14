import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

// Connection health error codes that mean the site itself is unreachable,
// as opposed to token/plugin/connection-configuration issues.
// Mirrors client/components/jetpack/connection-health/constants.js.
const SITE_UNREACHABLE_ERRORS = [ 'fatal_error', 'database_error', 'http_error', 'dns_error' ];

interface ConnectionHealth {
	is_healthy?: boolean;
	error?: string;
}

/**
 * Checks whether the currently selected site appears unreachable, based on the
 * Jetpack connection health endpoint. Only Atomic and Jetpack-connected sites
 * can be unreachable from wpcom's perspective; for Simple sites this reports the
 * site as reachable.
 *
 * Uses the dual-endpoint pattern: `wpcomRequest` in Calypso/Simple, and an
 * `apiFetch` fallback on Atomic (wp-admin/Gutenberg) where the wpcom APIs aren't
 * accessible — otherwise the affected site's own admin would never learn it is
 * unreachable.
 *
 * The endpoint is expensive, so the query only runs when `enabled` is true —
 * gate it on the caller actually needing the answer.
 */
export function useSiteConnectionHealth( enabled = true ) {
	const { site } = useHelpCenterContext();
	const siteId = site?.ID;
	const canBeUnreachable = Boolean( site && ( site.is_wpcom_atomic || site.jetpack ) );

	const { data, isLoading } = useQuery< ConnectionHealth, Error >( {
		queryKey: [ 'help-center-connection-health', siteId ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `/sites/${ siteId }/jetpack-connection-health`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						path: 'help-center/jetpack-connection-health',
						global: true,
				  } as APIFetchOptions ),
		enabled: enabled && canBeUnreachable && Boolean( siteId ),
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes.
		meta: { persist: false },
	} );

	const isSiteUnreachable = Boolean(
		data && ! data.is_healthy && SITE_UNREACHABLE_ERRORS.includes( data.error ?? '' )
	);

	return { isSiteUnreachable, isLoading };
}
