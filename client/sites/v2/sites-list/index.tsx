import { useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from 'calypso/dashboard/app/auth';
import { queryClient, persistPromise } from 'calypso/dashboard/app/query-client';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent, recordPageView } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import Layout, { router } from './layout';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';

export default function DashboardBackportSitesList() {
	const rootInstanceRef = useRef< ReturnType< typeof createRoot > | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );
	const user = useSelector( ( state ) => getCurrentUser( state ) );
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
				to: '/',
			} ),
		] ).then( () => {
			rootInstanceRef.current?.render( <Layout analyticsClient={ analyticsClient } /> );
		} );
	}, [ analyticsClient ] );

	// Use data already available in Redux to seed the React Query cache and avoid redundant data fetching.
	useEffect( () => {
		if ( user ) {
			queryClient.setQueryData( AUTH_QUERY_KEY, user );
		}
	}, [ user ] );

	return <div className="dashboard-backport-sites-list" ref={ containerRef } />;
}
