import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { persistPromise, queryClient } from 'calypso/dashboard/app/query-client';
import { getRouter } from './router';
import './style.scss';

export default function DashboardBackportSiteSettingsRenderer() {
	const rootInstanceRef = useRef< ReturnType< typeof createRoot > | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( ! containerRef.current ) {
			return;
		}

		const router = getRouter();
		if ( ! rootInstanceRef.current ) {
			rootInstanceRef.current = createRoot( containerRef.current );
		}

		persistPromise.then( () => {
			rootInstanceRef.current?.render(
				<QueryClientProvider client={ queryClient }>
					<RouterProvider router={ router } />
				</QueryClientProvider>
			);
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
	}, [] );

	return <div className="dashboard-backport-site-settings-root" ref={ containerRef } />;
}
