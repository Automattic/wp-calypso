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

export default function DashboardBackportDomains() {
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
			return;
		}

		Promise.all( [
			persistQueryClientPromise,
			queryClient.ensureQueryData( domainsQuery() ),
		] ).then( () => {
			rootInstanceRef.current?.render( <DomainLayout analyticsClient={ analyticsClient } /> );
		} );
	}, [ analyticsClient ] );

	useEffect( () => {
		if ( user ) {
			queryClient.setQueryData( AUTH_QUERY_KEY, user );
		}
	}, [ user ] );

	return <div className="dashboard-backport-domains-root" ref={ containerRef } />;
}
