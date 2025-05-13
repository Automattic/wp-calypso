import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { persistPromise, queryClient } from 'calypso/dashboard/app/query-client';
import { getRouter } from './router';

export default function Layout() {
	const rootInstanceRef = useRef< ReturnType< typeof createRoot > | null >( null );

	useEffect( () => {
		const rootElement = document.querySelector( '.hosting-dashboard-item-view__content' );
		if ( ! rootElement ) {
			return;
		}

		const router = getRouter();
		if ( ! rootInstanceRef.current ) {
			rootInstanceRef.current = createRoot( rootElement );
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

	return null;
}
