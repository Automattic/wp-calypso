/** @vitest-environment jsdom */
import {
	notificationDeviceQuery,
	notificationPushPermissionStateQuery,
} from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { BrowserNotificationCard } from '../index';

describe( 'BrowserNotificationCard', () => {
	const mockServiceWorkState = (
		queryClient: QueryClient,
		state: 'granted' | 'denied' | 'prompt' | 'not-supported'
	) => {
		queryClient.setQueryData( notificationPushPermissionStateQuery().queryKey, state );
	};

	const mockDeviceQuery = ( queryClient: QueryClient, deviceId: string ) => {
		queryClient.setQueryData( notificationDeviceQuery().queryKey, {
			ID: deviceId,
		} );
	};

	beforeEach( () => {
		Object.defineProperty( window, 'navigator', {
			value: {
				serviceWorker: {
					register: vi.fn(),
					ready: vi.fn(),
					getSubscription: vi.fn(),
				},
			},
		} );
	} );

	const Wrapper =
		( queryClient: QueryClient ) =>
		( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

	const renderWithProvider = ( ui: React.ReactElement, queryClient?: QueryClient ) => {
		return render( ui, { wrapper: Wrapper( queryClient || new QueryClient() ) } );
	};

	test( 'renders the option to enable browser notifications', async () => {
		const queryClient = new QueryClient();
		mockServiceWorkState( queryClient, 'granted' );
		renderWithProvider( <BrowserNotificationCard />, queryClient );

		await waitFor( () => {
			expect(
				screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
			).toBeEnabled();
		} );
	} );

	test( 'renders the option to disable browser notification when status is denied', () => {
		const queryClient = new QueryClient();
		mockServiceWorkState( queryClient, 'denied' );
		renderWithProvider( <BrowserNotificationCard />, queryClient );

		expect(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		).toBeDisabled();
	} );

	test( 'renders the option to disable browser notification when status is not supported', () => {
		const queryClient = new QueryClient();
		mockServiceWorkState( queryClient, 'not-supported' );

		renderWithProvider( <BrowserNotificationCard />, queryClient );

		expect(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		).toBeDisabled();
	} );

	test( 'registers a device when the feature is enabled', async () => {
		const queryClient = new QueryClient();
		mockServiceWorkState( queryClient, 'granted' );

		const browserSubscription = {
			endpoint: 'https://fcm.googleapis.com/fcm/send/fcm_token',
			keys: {
				p256dh: 'p256dh_key',
				auth: 'auth_key',
			},
		};

		Object.defineProperty( window.navigator.serviceWorker, 'ready', {
			value: {
				pushManager: {
					permissionState: vi.fn().mockResolvedValue( 'granted' ),
					getSubscription: vi.fn().mockResolvedValue( null ),
					subscribe: vi.fn().mockResolvedValue( browserSubscription ),
				},
			},
		} );

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/devices/new', {
				device_token: JSON.stringify( browserSubscription ),
				device_family: 'browser',
				device_name: 'Browser',
			} )
			.reply( 200 );

		renderWithProvider( <BrowserNotificationCard />, queryClient );

		await waitFor( () => {
			expect( screen.getByLabelText( 'Enable browser notifications' ) ).toBeEnabled();
		} );

		await userEvent.click(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		);

		await waitFor( () => {
			expect(
				screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
			).toBeChecked();
		} );
	} );

	test( 'removes a device when the checkbox is unchecked', async () => {
		const queryClient = new QueryClient();
		const deviceId = 'device_id_2';

		mockServiceWorkState( queryClient, 'granted' );
		mockDeviceQuery( queryClient, deviceId );

		nock( 'https://public-api.wordpress.com:443' )
			.post( `/rest/v1.1/${ deviceId }/delete` )
			.reply( 200 )
			.persist();

		renderWithProvider( <BrowserNotificationCard />, queryClient );

		const browserSubscription = {
			endpoint: 'https://fcm.googleapis.com/fcm/send/fcm_token',
			keys: {
				p256dh: 'p256dh_key',
				auth: 'auth_key',
			},
		};

		Object.defineProperty( window.navigator.serviceWorker, 'ready', {
			value: {
				pushManager: {
					permissionState: vi.fn().mockResolvedValue( 'granted' ),
					getSubscription: vi.fn().mockResolvedValue( browserSubscription ),
					subscribe: vi.fn().mockResolvedValue( null ),
				},
			},
		} );

		await waitFor( () => {
			expect(
				screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
			).toBeChecked();
		} );

		await userEvent.click(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		);

		await waitFor( () => {
			expect(
				screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
			).not.toBeChecked();
		} );
	} );
} );
