/** @jest-environment jsdom */
import { notificationDeviceQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { BrowserNotificationCard } from '../index';

describe( 'BrowserNotificationCard', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();

		Object.defineProperty( window, 'navigator', {
			value: {
				serviceWorker: {
					register: jest.fn(),
					ready: jest.fn(),
					getSubscription: jest.fn(),
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

	it( 'renders the option to enable browser notifications', async () => {
		renderWithProvider( <BrowserNotificationCard status="granted" /> );

		await waitFor( () => {
			expect(
				screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
			).toBeEnabled();
		} );
	} );

	it( 'renders the option to disable browser notification when status is denied', () => {
		renderWithProvider( <BrowserNotificationCard status="denied" /> );

		expect(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		).toBeDisabled();
	} );

	it( 'renders the option to disable browser notification when status is not supported', () => {
		renderWithProvider( <BrowserNotificationCard status="not-supported" /> );

		expect(
			screen.getByRole( 'checkbox', { name: 'Enable browser notifications' } )
		).toBeDisabled();
	} );

	it( 'registers a device when the feature is enabled', async () => {
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
					permissionState: jest.fn().mockResolvedValue( 'granted' ),
					getSubscription: jest.fn().mockResolvedValue( null ),
					subscribe: jest.fn().mockResolvedValue( browserSubscription ),
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

		renderWithProvider( <BrowserNotificationCard status="granted" /> );

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

	it( 'removes a device when the checkbox is unchecked', async () => {
		const queryClient = new QueryClient();
		const deviceId = 'device_id_2';

		queryClient.setQueryData( notificationDeviceQuery().queryKey, {
			ID: deviceId,
		} );

		nock( 'https://public-api.wordpress.com:443' )
			.post( `/rest/v1.1/${ deviceId }/delete` )
			.reply( 200 )
			.persist();

		renderWithProvider( <BrowserNotificationCard status="granted" />, queryClient );

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
					permissionState: jest.fn().mockResolvedValue( 'granted' ),
					getSubscription: jest.fn().mockResolvedValue( browserSubscription ),
					subscribe: jest.fn().mockResolvedValue( null ),
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
