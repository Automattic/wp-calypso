/**
 * @jest-environment jsdom
 */

import { notificationPushPermissionStateQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserNotificationNotice } from '../index';

const mockServiceWorkState = (
	queryClient: QueryClient,
	state: 'granted' | 'denied' | 'prompt' | 'not-supported'
) => {
	queryClient.setQueryData( notificationPushPermissionStateQuery().queryKey, state );
};

describe( 'BrowserNotificationNotice', () => {
	const Wrapper = ( queryClient: QueryClient ) => {
		return ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	};

	it( 'renders the notice when the browser notifications are blocked', async () => {
		const queryClient = new QueryClient();
		mockServiceWorkState( queryClient, 'denied' );

		render( <BrowserNotificationNotice />, { wrapper: Wrapper( queryClient ) } );

		await waitFor( () => {
			expect( screen.getByText( 'Browser notifications are blocked' ) ).toBeVisible();
		} );
	} );

	it( 'does not render the notice when the browser notifications are not blocked', async () => {
		const queryClient = new QueryClient();
		mockServiceWorkState( queryClient, 'granted' );

		render( <BrowserNotificationNotice />, { wrapper: Wrapper( queryClient ) } );

		expect( screen.queryByText( 'Browser notifications are blocked' ) ).not.toBeInTheDocument();
	} );
} );
