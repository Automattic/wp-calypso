/**
 * @jest-environment jsdom
 */

import { InputUserNotificationSettings, UserNotificationSettings } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Suspense } from 'react';
import { EmailSettings } from '..';
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

describe( 'EmailSettings', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();
		//Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
	} );

	it( 'renders the email settings values', async () => {
		mockGetSettingsApiAndReply( {
			other: {
				timeline: {
					comment_like: false,
					comment_reply: false,
				},
				devices: [],
				email: {
					comment_like: false,
					comment_reply: true,
				},
			},
		} );

		render( <EmailSettings />, {
			wrapper: Wrapper,
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: 'Likes on my comments' } ) ).not.toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: 'Replies to my comments' } ) ).toBeChecked();
		} );
	} );

	it( 'updates the settings when the checkbox is changed', async () => {
		mockGetSettingsApiAndReply( {
			other: {
				timeline: {
					comment_like: false,
					comment_reply: false,
				},
				devices: [],
				email: {
					comment_like: false,
					comment_reply: false,
				},
			},
		} );

		const updatedSettings = mockUpdateSettingsApiAndReply( {
			other: {
				email: {
					comment_like: true,
					comment_reply: false,
				},
			},
		} );

		render( <EmailSettings />, {
			wrapper: Wrapper,
		} );

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: 'Likes on my comments' } )
		);

		await waitFor( () => {
			expect( updatedSettings.isDone() ).toBe( true );
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( '"Likes on my comments" settings saved.' );
		} );
	} );
} );
