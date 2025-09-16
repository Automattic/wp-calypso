import { persistQueryClientPromise, siteBySlugQuery, queryClient } from '@automattic/api-queries';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from 'calypso/dashboard/app/auth';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { useAnalyticsClient } from '../hooks/use-analytics-client';
import Layout from './layout';
import router from './router';
import './style.scss';

export default function DashboardBackportSiteOverview( { siteSlug }: { siteSlug?: string } ) {
	const rootInstanceRef = useRef< ReturnType< typeof createRoot > | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );
	const user = useSelector( ( state ) => getCurrentUser( state ) );
	const site = useSelector( ( state ) => getSite( state, siteSlug ) );
	const analyticsClient = useAnalyticsClient( router );

	// Initialize the root instance.
	useEffect( () => {
		if ( ! containerRef.current || rootInstanceRef.current ) {
			return;
		}

		rootInstanceRef.current = createRoot( containerRef.current );
		return () => {
			const currentRoot = rootInstanceRef.current;
			if ( currentRoot ) {
				currentRoot.unmount();
				rootInstanceRef.current = null;
			}
		};
	}, [] );

	// Update the root instance upon dependency change.
	useEffect( () => {
		if ( ! rootInstanceRef.current ) {
			return;
		}

		Promise.all( [
			persistQueryClientPromise,
			router.preloadRoute( {
				to: `/sites/${ siteSlug }`,
			} ),
		] ).then( () => {
			rootInstanceRef.current?.render(
				<Layout analyticsClient={ analyticsClient } siteSlug={ siteSlug } />
			);
		} );
	}, [ analyticsClient, user, siteSlug ] );

	// Use data already available in Redux to seed the React Query cache and avoid redundant data fetching.
	useEffect( () => {
		if ( user ) {
			queryClient.setQueryData( AUTH_QUERY_KEY, user );
		}

		if ( site ) {
			// The site type used by the hosting dashboard is slightly different, but _mostly_ compatible,
			// so this is safe to copy in to the cache.
			queryClient.setQueryData( siteBySlugQuery( site.slug ).queryKey, site as any ); // eslint-disable-line @typescript-eslint/no-explicit-any
		}
	}, [ user, site ] );

	return <div className="dashboard-backport-site-overview" ref={ containerRef } />;
}
