import { getPersistQueryClientPromise, queryClient } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from 'calypso/dashboard/app/auth';
import { useAnalyticsClient } from 'calypso/sites/v2/hooks/use-analytics-client';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import Layout from './layout';
import router from './router';
import { shouldSeedSiteFilter } from './site-filter';
import type { PurchasesSection } from './site-filter';

import './style.scss';

export default function DashboardBackportSitePurchases( {
	path,
	section,
	siteId,
}: {
	path: string;
	section?: PurchasesSection;
	siteId?: number | null;
} ) {
	const rootInstanceRef = useRef< ReturnType< typeof createRoot > | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );
	const previousSectionRef = useRef< PurchasesSection | undefined >( undefined );
	const user = useSelector( getCurrentUser );
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

	useEffect( () => {
		const previousSection = previousSectionRef.current;
		previousSectionRef.current = section;

		const { pathname, search } = window.location;
		if ( shouldSeedSiteFilter( { section, previousSection, siteId, search } ) ) {
			page.replace( addQueryArgs( pathname + search, { site: siteId } ) );
		}
	}, [ section, siteId ] );

	// Update the root instance upon dependency change.
	useEffect( () => {
		if ( ! rootInstanceRef.current ) {
			return;
		}

		Promise.all( [
			getPersistQueryClientPromise( user?.ID ),
			router.preloadRoute( { to: path } ),
		] ).then( () => {
			rootInstanceRef.current?.render(
				<Layout analyticsClient={ analyticsClient } path={ path } />
			);
		} );
	}, [ analyticsClient, user, path ] );

	// Use data already available in Redux to seed the React Query cache and avoid redundant data fetching.
	useEffect( () => {
		if ( user ) {
			queryClient.setQueryData( AUTH_QUERY_KEY, user );
		}
	}, [ user ] );

	return <div className="dashboard-backport-site-purchases" ref={ containerRef } />;
}
