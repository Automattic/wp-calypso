/**
 * @jest-environment jsdom
 */

import {
	InputUserNotificationSettings,
	NotificationSettings,
	UserNotificationSettings,
} from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Suspense } from 'react';
import { WebSettings } from '..';
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

const buildWebNotificationSettings = (
	blogId: number,
	settings: Partial< NotificationSettings > = {}
) => {
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
					form_response: false,
					...settings,
				},
				devices: [],
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
					form_response: false,
				},
			},
		],
	};
};

describe( 'WebSettings', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();

		//Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
	} );

	it( 'renders the web settings values', async () => {
		mockGetSettingsApiAndReply(
			buildWebNotificationSettings( 1, {
				comment_like: true,
				new_comment: false,
			} )
		);

		render( <WebSettings siteId={ 1 } />, {
			wrapper: Wrapper,
		} );

		expect(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'comment_like' ) } )
		).toBeChecked();

		expect(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'new_comment' ) } )
		).not.toBeChecked();

		expect(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'form_response' ) } )
		).not.toBeChecked();
	} );

	it( 'updates the settings when the checkbox is changed', async () => {
		const blogId = 3;
		const settings = buildWebNotificationSettings( blogId, {
			comment_like: false,
			comment_reply: false,
		} );

		const updatedSettings = {
			...settings.blogs[ 0 ].timeline,
			comment_like: true,
		};

		mockGetSettingsApiAndReply( settings );

		const updatedSettingsApi = mockUpdateSettingsApiAndReply( {
			blogs: [
				{
					blog_id: blogId,
					timeline: updatedSettings,
				},
			],
		} );

		render( <WebSettings siteId={ blogId } />, {
			wrapper: Wrapper,
		} );

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: getFieldLabel( 'comment_like' ) } )
		);

		await waitFor( () => {
			expect( updatedSettingsApi.isDone() ).toBe( true );

			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( '"Likes on my comments" settings saved.' );
		} );
	} );

	it( 'closes the modal when the the apply all modal is called', async () => {
		const blogId = 4;
		const settings = buildWebNotificationSettings( blogId, {
			comment_like: false,
			comment_reply: false,
		} );

		mockGetSettingsApiAndReply( settings );

		render( <WebSettings siteId={ blogId } />, {
			wrapper: Wrapper,
		} );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Apply to all sites' } ) );
		const modal = await screen.findByRole( 'dialog', { name: 'Apply to all sites?' } );

		//modal is visible
		await waitFor( () => {
			expect( modal ).toBeVisible();
		} );

		const cancelButtons = await within( modal ).findAllByRole( 'button', { name: 'Cancel' } );
		// The modal close button is also a cancel button, it is the reason we have 2 cancel buttons
		await userEvent.click( cancelButtons[ 1 ] );

		await waitFor( () => {
			expect( modal ).not.toBeInTheDocument();
		} );
	} );

	it( 'updates all settings when the apply all button is clicked', async () => {
		const blogId = 4;
		const settings = buildWebNotificationSettings( blogId, {
			comment_like: false,
			comment_reply: false,
		} );

		const expectedQuery = {
			applyToAll: 'true',
		};

		mockGetSettingsApiAndReply( settings );

		const updatedSettingsApi = mockUpdateSettingsApiAndReply(
			{
				blogs: [ settings.blogs[ 0 ] ],
			},
			expectedQuery
		);

		render( <WebSettings siteId={ blogId } />, {
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
			expect(
				screen.queryByRole( 'dialog', { name: 'Apply to all sites?' } )
			).not.toBeInTheDocument();
		} );
	} );
} );
