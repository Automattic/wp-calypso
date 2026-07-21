import { isWpError, type Site, type User } from '@automattic/api-core';
import {
	omnibarSiteIdQuery,
	queryClient,
	rawUserPreferencesQuery,
	siteByIdQuery,
	userPreferenceOptimisticMutation,
} from '@automattic/api-queries';
import calypsoConfig from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { removeQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { AUTH_QUERY_KEY } from '../auth';

function isMemberOfSite( site: Site ) {
	// If the user is a member of the site, the capabilities property will exist
	return !! site.capabilities;
}

// Fetch a candidate site, tolerating failures so the omnibar can still fall
// back to the next candidate (or the user's primary blog).
async function ensureSite( siteId: number | undefined ) {
	if ( ! siteId ) {
		return undefined;
	}
	try {
		return await queryClient.ensureQueryData( siteByIdQuery( siteId ) );
	} catch {
		return undefined;
	}
}

/**
 * Keeps the omnibar's current site in sync with the URL, the most recent sites,
 * or the user's primary blog, in that priority.
 *
 * The work runs in response to route-resolution events rather than from a
 * reactive effect. Recording the current site into the `recentSites` preference
 * is an optimistic write that rolls back on failure; driving it off a `useEffect`
 * dependency on `recentSites` meant a persistently failing write kept re-triggering
 * itself. Reacting to navigation events instead means a rolled-back write emits no
 * event and is not retried.
 */
export function useSyncOmnibarSite() {
	const router = useRouter();
	const { mutate: updateRecentSites } = useMutation(
		userPreferenceOptimisticMutation( 'recentSites' ),
		queryClient
	);

	useEffect( () => {
		let cancelled = false;

		async function resolveOmnibarSite() {
			const user = queryClient.getQueryData< User >( AUTH_QUERY_KEY );

			const routeSite = router.state.matches.findLast(
				( match ) => !! ( match.loaderData as { site?: Site } )?.site
			)?.loaderData?.site;

			// When coming from a site's wp-admin, the URL may contain an `origin_site_id` query param.
			const originSiteIdParam = Number(
				( router.state.location.search as Record< string, string | undefined > ).origin_site_id
			);
			const originSiteId = originSiteIdParam > 0 ? originSiteIdParam : undefined;

			let recentSiteIds: number[] = [];
			try {
				const preferences = await queryClient.ensureQueryData( rawUserPreferencesQuery() );
				recentSiteIds = preferences.recentSites ?? [];
			} catch {
				recentSiteIds = [];
			}

			const recentSiteId =
				queryClient.getQueryData< number | null >( omnibarSiteIdQuery().queryKey ) ||
				recentSiteIds[ 0 ];

			const [ originSite, recentSite ] = await Promise.all( [
				ensureSite( originSiteId ),
				ensureSite( recentSiteId ),
			] );

			if ( cancelled ) {
				return;
			}

			// `omnibarSiteIdQuery` is used as cross-tree shared state — its placeholder
			// queryFn resolves to `null`. If it's still in flight when we write here,
			// the resolution will overwrite our value and the omnibar loses the site.
			queryClient.cancelQueries( { queryKey: omnibarSiteIdQuery().queryKey } );

			const omnibarSite = [ routeSite, originSite, recentSite ].find(
				( site ) => site && isMemberOfSite( site )
			);
			const omnibarSiteId = omnibarSite?.ID ?? user?.primary_blog;
			queryClient.setQueryData( omnibarSiteIdQuery().queryKey, () => omnibarSiteId );

			// Remove the `origin_site_id` query param from the URL.
			if ( originSiteId ) {
				window.history.replaceState(
					null,
					'',
					removeQueryArgs( window.location.pathname + window.location.search, 'origin_site_id' )
				);
			}

			if ( omnibarSiteId && omnibarSiteId !== recentSiteIds[ 0 ] ) {
				updateRecentSites( [ ...new Set( [ omnibarSiteId, ...recentSiteIds ] ) ].slice( 0, 5 ), {
					onError: ( error ) => {
						logToLogstash( {
							feature: 'calypso_client',
							message: error.message,
							tags: [ 'dashboard', 'recent-sites-update-fail' ],
							properties: {
								status: isWpError( error ) ? error.status : undefined,
								error_name: isWpError( error ) ? error.name : undefined,
								env_id: calypsoConfig( 'env_id' ),
								message: error.message,
								path: window.location.href,
								omnibar_site_id: omnibarSiteId,
								recent_site_ids: recentSiteIds,
							},
						} );
					},
				} );
			}
		}

		// `onResolved` fires on each navigation once its matches have loaded. If the
		// initial route already resolved before this effect ran, that event has been
		// missed, so run once now; `resolvedLocation` is only set once the first
		// resolution has happened, so this never double-fires with the event below.
		if ( router.state.resolvedLocation ) {
			resolveOmnibarSite();
		}

		const unsubscribe = router.subscribe( 'onResolved', () => {
			resolveOmnibarSite();
		} );

		return () => {
			cancelled = true;
			unsubscribe();
		};
	}, [ router, updateRecentSites ] );
}
