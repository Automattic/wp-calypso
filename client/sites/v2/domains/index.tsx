import { persistQueryClientPromise, queryClient, domainsQuery } from '@automattic/api-queries';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from 'calypso/dashboard/app/auth';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useAnalyticsClient } from '../hooks/use-analytics-client';
import DomainLayout from './layout';
import router from './router';
import './style.scss';
import type { Store } from 'redux';

export default function DashboardBackportDomains( {
	store,
	siteSlug,
	feature,
}: {
	store: Store;
	siteSlug?: string;
	feature?: string;
} ) {
	// return <div>DashboardBackportDomains</div>;
	const rootInstanceRef = useRef< ReturnType< typeof createRoot > | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );
	const user = useSelector( ( state ) => getCurrentUser( state ) );
	const analyticsClient = useAnalyticsClient( router );

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

	useEffect( () => {
		if ( ! rootInstanceRef.current ) {
			console.log( 'rootInstanceRef.current is null' );
			return;
		}

		// Promise.all( [
		// 	persistQueryClientPromise,
		// 	queryClient.ensureQueryData( domainsQuery() ),
		// ] ).then( () => {
		Promise.all( [
			persistQueryClientPromise,
			router.preloadRoute( {
				to: `/domains/${ siteSlug }`,
			} ),
		] ).then( () => {
			console.log( 'rendering DomainLayout' );
			rootInstanceRef.current?.render(
				<DomainLayout
					store={ store }
					analyticsClient={ analyticsClient }
					siteSlug={ siteSlug }
					feature={ feature }
				/>
			);
		} );
	}, [ analyticsClient, user, siteSlug ] );

	useEffect( () => {
		if ( user ) {
			queryClient.setQueryData( AUTH_QUERY_KEY, user );
		}
	}, [ user ] );

	return <div className="dashboard-backport-domains-root" ref={ containerRef } />;
}
