import { useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { persistPromise } from 'calypso/dashboard/app/query-client';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent, recordPageView } from 'calypso/state/analytics/actions';
import Layout from './layout';
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

		persistPromise.then( () => {
			rootInstanceRef.current?.render(
				<Layout store={ store } analyticsClient={ analyticsClient } />
			);
		} );
	}, [ analyticsClient, store, siteSlug, feature ] );

	return <div className="dashboard-backport-site-settings-root" ref={ containerRef } />;
}
