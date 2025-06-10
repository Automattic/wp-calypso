import { useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { persistPromise } from 'calypso/dashboard/app/query-client';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent, recordPageView } from 'calypso/state/analytics/actions';
import Layout from './layout';
import type { AnalyticsClient } from 'calypso/dashboard/app/analytics';

export default function DashboardBackportSiteSettingsRenderer() {
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

	useEffect( () => {
		if ( ! containerRef.current ) {
			return;
		}

		if ( ! rootInstanceRef.current ) {
			rootInstanceRef.current = createRoot( containerRef.current );
		}

		persistPromise.then( () => {
			rootInstanceRef.current?.render( <Layout analyticsClient={ analyticsClient } /> );
		} );

		return () => {
			if ( rootInstanceRef.current ) {
				// Wait for the router to unmount.
				setTimeout( () => {
					rootInstanceRef.current?.unmount();
					rootInstanceRef.current = null;
				} );
			}
		};
	}, [ analyticsClient ] );

	return <div className="dashboard-backport-site-settings-root" ref={ containerRef } />;
}
