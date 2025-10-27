/**
 * @jest-environment jsdom
 */

import {
	InputUserNotificationSettings,
	UserNotificationDevice,
	UserNotificationSettings,
} from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Suspense } from 'react';
import { DevicesSettings } from '..';
import Snackbars from '../../../../app/snackbars';

const Wrapper = ( { children }: { children: React.ReactNode } ) => {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );
	return (
		<QueryClientProvider client={ queryClient }>
			<Snackbars />
			<Suspense fallback={ <p> Loading... </p> }>{ children }</Suspense>
		</QueryClientProvider>
	);
};

const notificationSnackBar = () => {
	//Snackbar requires a custom matcher because it's aria-live is not supported by the testing library
	return document.getElementById( 'a11y-speak-polite' );
};

const mockGetSettingsApiAndReply = ( data: Partial< UserNotificationSettings > ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/me/notifications/settings' )
		.once()
		.reply( 200, data );
};

const mockUpdateSettingsApiAndReply = ( data: InputUserNotificationSettings ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/me/notifications/settings?', data )
		.once()
		.reply( 200, data );
};

const mockGetDevicesApiAndReply = ( data: Partial< UserNotificationDevice[] > ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/notifications/devices' )
		.once()
		.reply( 200, data );
};

describe( 'DevicesSettings', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();
		//Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
	} );

	it( 'shows a message when there are no devices', async () => {
		mockGetDevicesApiAndReply( [] );
		mockGetDevicesApiAndReply( [] );
		mockGetSettingsApiAndReply( {
			other: {
				timeline: {
					comment_like: false,
					comment_reply: false,
				},
				email: {
					comment_like: false,
					comment_reply: false,
				},
				devices: [],
			},
		} );

		render( <DevicesSettings />, {
			wrapper: Wrapper,
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'option', { name: 'No devices found' } ) ).toBeVisible();
		} );
	} );

	it( 'renders a list of devices', async () => {
		mockGetDevicesApiAndReply( [
			{
				device_id: '123',
				device_name: 'Device 1',
				device_model: 'Device 1',
				device_type: 'Device 1',
			},
			{
				device_id: '456',
				device_name: 'Device 2',
				device_model: 'Device 2',
				device_type: 'Device 2',
			},
		] );

		mockGetSettingsApiAndReply( {
			other: {
				devices: [
					{
						device_id: 123, // Yes it is a number :(,
						comment_like: false,
						comment_reply: false,
					},
					{
						device_id: 456, // Yes it is a number :(,
						comment_like: false,
						comment_reply: false,
					},
				],
				timeline: {
					comment_like: false,
					comment_reply: false,
				},
				email: {
					comment_like: false,
					comment_reply: false,
				},
			},
		} );

		render( <DevicesSettings />, {
			wrapper: Wrapper,
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Device 1' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders the devices settings values', async () => {
		const device1 = {
			device_id: '123',
			device_name: 'Device 1',
			device_model: 'Device 1',
			device_type: 'Device 1',
		};
		mockGetDevicesApiAndReply( [ device1 ] );
		mockGetSettingsApiAndReply( {
			other: {
				timeline: {
					comment_like: false,
					comment_reply: false,
				},
				devices: [
					{
						device_id: parseInt( device1.device_id ), // Yes it is a number :(,
						comment_like: true,
						comment_reply: true,
					},
				],
				email: {
					comment_like: false,
					comment_reply: false,
				},
			},
		} );

		render( <DevicesSettings />, {
			wrapper: Wrapper,
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: 'Likes on my comments' } ) ).toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: 'Replies to my comments' } ) ).toBeChecked();
		} );
	} );

	it( 'updates the settings when a new device is selected', async () => {
		const device1 = {
			device_id: '123',
			device_name: 'Device 1',
			device_model: 'Device 1',
			device_type: 'Device 1',
		};
		const device2 = {
			device_id: '456',
			device_name: 'Device 2',
			device_model: 'Device 2',
			device_type: 'Device 2',
		};

		mockGetDevicesApiAndReply( [ device1, device2 ] );
		mockGetSettingsApiAndReply( {
			other: {
				timeline: {
					comment_like: false,
					comment_reply: false,
				},
				devices: [
					{
						device_id: parseInt( device1.device_id ), // Yes it is a number instead of a string :(,
						comment_like: false,
						comment_reply: false,
					},
					{
						device_id: parseInt( device2.device_id ), // Yes it is a number instead of a string :(,
						comment_like: true,
						comment_reply: true,
					},
				],
				email: {
					comment_like: false,
					comment_reply: false,
				},
			},
		} );

		render( <DevicesSettings />, {
			wrapper: Wrapper,
		} );

		// Device 1 should not have likes on my comments
		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: 'Likes on my comments' } ) ).not.toBeChecked();
			expect(
				screen.getByRole( 'checkbox', { name: 'Replies to my comments' } )
			).not.toBeChecked();
		} );

		// Select Device 2
		await userEvent.selectOptions( screen.getByRole( 'combobox' ), 'Device 2' );

		// Device 2 should have likes on my comments
		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: 'Likes on my comments' } ) ).toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: 'Replies to my comments' } ) ).toBeChecked();
		} );
	} );

	it( 'updates the settings when the toggle is changed', async () => {
		const device1 = {
			device_id: '123',
			device_name: 'Device 1',
			device_model: 'Device 1',
			device_type: 'Device 1',
		};
		mockGetDevicesApiAndReply( [ device1 ] );
		mockGetSettingsApiAndReply( {
			other: {
				devices: [
					{
						device_id: parseInt( device1.device_id ), // Yes it is a number instead of a string :(,
						comment_like: false,
						comment_reply: false,
					},
				],
				timeline: {
					comment_like: false,
					comment_reply: false,
				},
				email: {
					comment_like: false,
					comment_reply: false,
				},
			},
		} );

		const savedSettingsApi = mockUpdateSettingsApiAndReply( {
			other: {
				devices: [
					{
						device_id: parseInt( device1.device_id ), // Yes it is a number instead of a string :(,
						comment_like: true,
						comment_reply: false,
					},
				],
			},
		} );

		render( <DevicesSettings />, {
			wrapper: Wrapper,
		} );

		// Starts unchecked
		expect(
			await screen.findByRole( 'checkbox', { name: 'Likes on my comments' } )
		).not.toBeChecked();

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: 'Likes on my comments' } )
		);

		await waitFor( async () => {
			expect( savedSettingsApi.isDone() ).toBe( true );
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( '"Likes on my comments" settings saved.' );
		} );
	} );
} );
