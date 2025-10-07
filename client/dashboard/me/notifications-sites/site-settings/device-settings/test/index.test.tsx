/**
 * @jest-environment jsdom
 */

import {
	DeviceNotificationSettings,
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
import Snackbars from '../../../../../app/snackbars';
import { getFieldLabel } from '../../../helpers/translations';

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

const mockUpdateSettingsApiAndReply = (
	data: InputUserNotificationSettings,
	query: Record< string, string > = {}
) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/me/notifications/settings', data )
		.query( query )
		.once()
		.reply( 200, data );
};

const buildNotificationSettings = ( blogId: number, devices: DeviceNotificationSettings[] ) => {
	return {
		blogs: [
			{
				blog_id: blogId,
				timeline: {
					comment_like: false,
					comment_reply: true,
					new_comment: false,
					post_like: false,
					follow: false,
					achievement: false,
					mentions: false,
					scheduled_publicize: false,
					blogging_prompt: false,
					draft_post_prompt: false,
					store_order: false,
					recommended_blog: false,
				},
				devices: devices,
				email: {
					comment_like: false,
					comment_reply: false,
					new_comment: false,
					post_like: false,
					follow: false,
					achievement: false,
					mentions: false,
					scheduled_publicize: false,
					blogging_prompt: false,
					draft_post_prompt: false,
					store_order: false,
					recommended_blog: false,
				},
			},
		],
	};
};

const buildDevice = (
	settings: Partial< UserNotificationDevice > = {}
): UserNotificationDevice => {
	return {
		device_id: 0,
		device_name: 'Device 1',
		device_model: 'DeviceModel 1',
		device_type: 'DeviceType 1',
		...settings,
	} as UserNotificationDevice;
};

const buildDeviceSettings = (
	settings: Partial< DeviceNotificationSettings >
): DeviceNotificationSettings => {
	return {
		new_comment: false,
		comment_like: false,
		post_like: false,
		follow: false,
		achievement: false,
		mentions: false,
		scheduled_publicize: false,
		store_order: false,
		blogging_prompt: false,
		draft_post_prompt: false,
		recommended_blog: false,
		comment_reply: false,
		device_id: 0,
		...settings,
	} as DeviceNotificationSettings;
};

const mockGetDevicesApiAndReply = ( devices: UserNotificationDevice[] ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/notifications/devices' )
		.once()
		.reply( 200, devices );
};

describe( 'DevicesSettings', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();

		//Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
	} );

	it( 'renders a list of devices names', async () => {
		const devices = [
			buildDevice( {
				device_id: '1',
				device_name: 'Device 1',
			} ),
			buildDevice( {
				device_id: '2',
				device_name: 'Device 2',
			} ),
		];

		const devicesSettings = buildNotificationSettings( 1, [
			buildDeviceSettings( {
				device_id: 1,
			} ),
			buildDeviceSettings( {
				device_id: 2,
			} ),
		] );

		mockGetDevicesApiAndReply( devices );
		mockGetSettingsApiAndReply( devicesSettings );

		render( <DevicesSettings siteId={ 1 } />, {
			wrapper: Wrapper,
		} );

		expect( await screen.findByRole( 'option', { name: 'Device 1' } ) ).toBeVisible();
		expect( await screen.findByRole( 'option', { name: 'Device 2' } ) ).toBeVisible();
	} );

	it( 'renders the device settings values', async () => {
		const blogId = 2;

		const devices = [
			buildDevice( {
				device_id: '1',
				device_name: 'Device 1',
			} ),
		];
		const devicesSettings = buildNotificationSettings( blogId, [
			buildDeviceSettings( {
				device_id: 1,
				comment_like: true,
				new_comment: false,
			} ),
		] );

		mockGetDevicesApiAndReply( devices );
		mockGetSettingsApiAndReply( devicesSettings );

		render( <DevicesSettings siteId={ blogId } />, {
			wrapper: Wrapper,
		} );

		expect(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'comment_like' ) } )
		).toBeChecked();

		expect(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'new_comment' ) } )
		).not.toBeChecked();
	} );

	it( 'shows new settings state when the device is changed', async () => {
		const devices = [
			buildDevice( {
				device_id: '1',
				device_name: 'Device 1',
			} ),
			buildDevice( {
				device_id: '2',
				device_name: 'Device 2',
			} ),
		];

		const devicesSettings = buildNotificationSettings( 1, [
			buildDeviceSettings( {
				device_id: 1,
				comment_like: true,
			} ),
			buildDeviceSettings( {
				device_id: 2,
				comment_like: false,
			} ),
		] );

		mockGetDevicesApiAndReply( devices );
		mockGetSettingsApiAndReply( devicesSettings );

		render( <DevicesSettings siteId={ 1 } />, {
			wrapper: Wrapper,
		} );

		// Checked for device 1
		expect(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'comment_like' ) } )
		).toBeChecked();

		// Select the device 2
		await userEvent.selectOptions( screen.getByRole( 'combobox' ), 'Device 2' );

		// Unchecked for device 2
		expect(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'comment_like' ) } )
		).not.toBeChecked();
	} );

	it( 'updates all settings when the apply the `Apply to all sites` button is clicked', async () => {
		const blogId = 4;

		const devices = [
			buildDevice( {
				device_id: '1',
				device_name: 'Device 1',
			} ),
		];
		const blogSettings = buildNotificationSettings( blogId, [
			buildDeviceSettings( {
				device_id: 1,
				comment_like: true,
			} ),
			buildDeviceSettings( {
				device_id: 2,
				comment_like: false,
			} ),
		] );

		mockGetSettingsApiAndReply( blogSettings );
		mockGetDevicesApiAndReply( devices );

		const expectedQuery = {
			applyToAll: 'true',
		};

		//sends the whole blog settings to object + the applyToAll query
		const updatedSettingsApi = mockUpdateSettingsApiAndReply( blogSettings, expectedQuery );

		render( <DevicesSettings siteId={ blogId } />, {
			wrapper: Wrapper,
		} );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Apply to all sites' } ) );

		//modal is visible
		await waitFor( () => {
			expect( screen.queryByRole( 'dialog', { name: 'Apply to all sites?' } ) ).toBeVisible();
		} );

		await userEvent.click(
			await screen.findByRole( 'button', { name: 'Yes, apply to all sites' } )
		);

		await waitFor( () => {
			expect( updatedSettingsApi.isDone() ).toBe( true );
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( 'Settings saved successfully.' );
		} );
	} );

	it( 'updates the selected device settings when the option is changed', async () => {
		const blogId = 4;

		const devices = [
			buildDevice( {
				device_id: '1',
				device_name: 'Device 1',
			} ),
		];
		const deviceSettings = buildDeviceSettings( {
			device_id: 1,
			comment_like: true,
		} );

		const blogSettings = buildNotificationSettings( blogId, [ deviceSettings ] );

		mockGetDevicesApiAndReply( devices );
		mockGetSettingsApiAndReply( blogSettings );

		//sends the whole blog settings to object + the applyToAll query
		const updatedSettingsApi = mockUpdateSettingsApiAndReply( {
			blogs: [
				{
					blog_id: blogId,
					devices: [
						{
							...deviceSettings,
							comment_like: false,
						},
					],
				},
			],
		} );

		render( <DevicesSettings siteId={ blogId } />, {
			wrapper: Wrapper,
		} );

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'comment_like' ) } )
		);

		await waitFor( () => {
			expect( updatedSettingsApi.isDone() ).toBe( true );
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( 'Settings saved successfully.' );
		} );
	} );
} );
