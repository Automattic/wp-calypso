import { useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from 'calypso/dashboard/app/auth';
import { siteBySlugQuery } from 'calypso/dashboard/app/queries/site';
import { siteSettingsQuery } from 'calypso/dashboard/app/queries/site-settings';
import { queryClient, persistPromise } from 'calypso/dashboard/app/query-client';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent, recordPageView } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import Layout, { router } from './layout';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';
import type { Store } from 'redux';

export default function DashboardBackportSiteSettingsRenderer( {
	store,
	siteSlug,
	feature,
}: {
	store: Store;
	siteSlug?: string;
	feature?: string;
} ) {
	const rootInstanceRef = useRef< ReturnType< typeof createRoot > | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );
	const user = useSelector( ( state ) => getCurrentUser( state ) );
	const site = useSelector( ( state ) => getSite( state, siteSlug ) );
	const siteSettings = useSelector( ( state ) => site?.ID && getSiteSettings( state, site.ID ) );
	const dispatch = useDispatch();

	const analyticsClient: AnalyticsClient = useMemo(
		() => ( {
			recordTracksEvent( eventName, properties ) {
				dispatch( recordTracksEvent( eventName, properties ) );
			},
			recordPageView( url, title ) {
				dispatch( recordPageView( url, title ) );
			},
		} ),
		[ dispatch ]
	);

	// Initialize the root instance.
	useEffect( () => {
		if ( ! containerRef.current || rootInstanceRef.current ) {
			return;
		}

		rootInstanceRef.current = createRoot( containerRef.current );
		return () => {
			const currentRoot = rootInstanceRef.current;
			if ( currentRoot ) {
				requestAnimationFrame( () => {
					currentRoot.unmount();
					rootInstanceRef.current = null;
				} );
			}
		};
	}, [] );

	// Update the root instance upon dependency change.
	useEffect( () => {
		if ( ! rootInstanceRef.current ) {
			return;
		}

		Promise.all( [
			persistPromise,
			router.preloadRoute( {
				to: `/${ siteSlug }`,
			} ),
		] ).then( () => {
			rootInstanceRef.current?.render(
				<Layout
					store={ store }
					analyticsClient={ analyticsClient }
					siteSlug={ siteSlug }
					feature={ feature }
				/>
			);
		} );
	}, [ store, analyticsClient, user, siteSlug, feature ] );

	// Use data already available in Redux to seed the React Query cache and avoid redundant data fetching.
	useEffect( () => {
		if ( user ) {
			queryClient.setQueryData( AUTH_QUERY_KEY, user );
		}

		if ( site ) {
			queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, site );
		}

		if ( site && siteSettings ) {
			queryClient.setQueryData( siteSettingsQuery( site.ID ).queryKey, siteSettings );
		}
	}, [ user, site, siteSettings ] );

	return <div className="dashboard-backport-site-settings-root" ref={ containerRef } />;
}
