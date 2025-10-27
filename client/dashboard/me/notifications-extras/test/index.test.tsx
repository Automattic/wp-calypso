/**
 * @jest-environment jsdom
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../app/snackbars';
import { render as dashboardRender } from '../../../test-utils';
import NotificationsExtras from '../index';
import type { UserNotificationSettings, WpcomNotificationSettings } from '@automattic/api-core';

jest.mock( '../../../app/analytics', () => ( {
	useAnalytics: jest.fn().mockReturnValue( {
		recordTracksEvent: jest.fn(),
	} ),
} ) );

const defaultWpcomSettings: WpcomNotificationSettings = {
	marketing: false,
	research: false,
	affiliates: false,
	community: false,
	promotion: false,
	news: false,
	digest: false,
	reports: false,
	news_developer: false,
	wpcom_spain: false,
	scheduled_updates: false,
	learn: false,
	a4a_agencies: false,
	jetpack_agencies: false,
	jetpack_manage_onboarding: false,
	jetpack_marketing: false,
	jetpack_research: false,
	jetpack_promotion: false,
	jetpack_news: false,
	jetpack_reports: false,
	akismet_marketing: false,
	woopay_marketing: false,
	gravatar_onboarding: false,
};

const defaultUserSettings: UserNotificationSettings = {
	blogs: [],
	other: {
		timeline: { comment_like: false, comment_reply: false },
		email: { comment_like: false, comment_reply: false },
		devices: [],
	},
	wpcom: defaultWpcomSettings,
};

const mockGetNotificationSettingsApi = (
	settings: UserNotificationSettings = defaultUserSettings
) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/me/notifications/settings' )
		.reply( 200, settings );
};

const mockSaveNotificationSettingsApi = (
	expectedSettings: Partial< WpcomNotificationSettings >
) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/me/notifications/settings', {
			wpcom: expectedSettings,
		} )
		.reply( 200, { wpcom: expectedSettings } );
};

const notificationSnackBar = () => {
	// Snackbar requires a custom matcher because its aria-live is not supported by the testing library
	return document.getElementById( 'a11y-speak-polite' );
};

describe( 'NotificationsExtras', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();
		// Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'renders the page header and sections correctly', async () => {
		mockGetNotificationSettingsApi();

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Extras' ) ).toBeVisible();
		} );

		expect(
			screen.getByText( /Get curated extras like reports, digests, and community updates/ )
		).toBeVisible();

		expect( screen.getByText( 'Email from WordPress.com' ) ).toBeVisible();
		expect( screen.getByText( 'Email from Jetpack' ) ).toBeVisible();

		expect(
			screen.getByText(
				'Jetpack is a suite of tools connected to your WordPress site, like backups, security, and performance reports.'
			)
		).toBeVisible();
	} );

	it( 'displays all WordPress.com notification options', async () => {
		mockGetNotificationSettingsApi();

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Email from WordPress.com' ) ).toBeVisible();
		} );

		// Get the WordPress.com section and scope assertions within it
		const wpcomSection = screen
			.getByRole( 'heading', { name: 'Email from WordPress.com' } )
			.closest( '[class*="card"]' );
		expect( wpcomSection ).toBeInTheDocument();

		// TypeScript assertion: we know this is an HTMLElement since the test above passed
		const wpcomSectionQueries = within( wpcomSection as HTMLElement );
		expect( wpcomSectionQueries.getByLabelText( 'Suggestions' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Research' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Community' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Promotions' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Newsletter' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Digests' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Reports' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Developer Newsletter' ) ).toBeVisible();
		expect( wpcomSectionQueries.getByLabelText( 'Scheduled updates' ) ).toBeVisible();
	} );

	it( 'displays all Jetpack notification options', async () => {
		mockGetNotificationSettingsApi();

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Email from Jetpack' ) ).toBeVisible();
		} );

		// Get the Jetpack section and scope assertions within it
		const jetpackSection = screen
			.getByRole( 'heading', { name: 'Email from Jetpack' } )
			.closest( '[class*="card"]' );
		expect( jetpackSection ).toBeInTheDocument();

		// TypeScript assertion: we know this is an HTMLElement since the test above passed
		const jetpackSectionQueries = within( jetpackSection as HTMLElement );
		expect( jetpackSectionQueries.getByLabelText( 'Suggestions' ) ).toBeVisible();
		expect( jetpackSectionQueries.getByLabelText( 'Research' ) ).toBeVisible();
		expect( jetpackSectionQueries.getByLabelText( 'Promotions' ) ).toBeVisible();
		expect( jetpackSectionQueries.getByLabelText( 'Newsletter' ) ).toBeVisible();
		expect( jetpackSectionQueries.getByLabelText( 'Reports' ) ).toBeVisible();
	} );

	it( 'shows current settings correctly', async () => {
		const customSettings: UserNotificationSettings = {
			...defaultUserSettings,
			wpcom: {
				...defaultWpcomSettings,
				marketing: true,
				research: true,
				jetpack_marketing: true,
				jetpack_news: true,
			},
		};

		mockGetNotificationSettingsApi( customSettings );

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			// WordPress.com section - first Suggestions toggle should be checked
			const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
			expect( wpcomSuggestions ).toBeChecked();
		} );

		// WordPress.com toggles - verify enabled ones are checked
		const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
		const wpcomResearch = screen.getAllByLabelText( 'Research' )[ 0 ];
		expect( wpcomSuggestions ).toBeChecked();
		expect( wpcomResearch ).toBeChecked();

		// WordPress.com toggles - verify disabled ones are unchecked
		expect( screen.getByLabelText( 'Community' ) ).not.toBeChecked();
		expect( screen.getAllByLabelText( 'Promotions' )[ 0 ] ).not.toBeChecked();
		expect( screen.getAllByLabelText( 'Newsletter' )[ 0 ] ).not.toBeChecked();
		expect( screen.getByLabelText( 'Digests' ) ).not.toBeChecked();
		expect( screen.getAllByLabelText( 'Reports' )[ 0 ] ).not.toBeChecked();
		expect( screen.getByLabelText( 'Developer Newsletter' ) ).not.toBeChecked();
		expect( screen.getByLabelText( 'Scheduled updates' ) ).not.toBeChecked();

		// Jetpack toggles - verify enabled ones are checked
		const jetpackSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 1 ];
		const jetpackNewsletter = screen.getAllByLabelText( 'Newsletter' )[ 1 ];
		expect( jetpackSuggestions ).toBeChecked();
		expect( jetpackNewsletter ).toBeChecked();

		// Jetpack toggles - verify disabled ones are unchecked
		expect( screen.getAllByLabelText( 'Research' )[ 1 ] ).not.toBeChecked();
		expect( screen.getAllByLabelText( 'Promotions' )[ 1 ] ).not.toBeChecked();
		expect( screen.getAllByLabelText( 'Reports' )[ 1 ] ).not.toBeChecked();
	} );

	it( 'shows snackbar notification on single setting change', async () => {
		mockGetNotificationSettingsApi();
		mockSaveNotificationSettingsApi( { marketing: true } );

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
			expect( wpcomSuggestions ).not.toBeChecked();
		} );

		// Click the WordPress.com Suggestions toggle
		const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
		await userEvent.click( wpcomSuggestions );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( '"Suggestions" settings saved.' );
		} );
	} );

	it( 'shows snackbar notification when all settings are saved', async () => {
		mockGetNotificationSettingsApi();
		mockSaveNotificationSettingsApi( {
			marketing: true,
			research: true,
			community: true,
			promotion: true,
			news: true,
			digest: true,
			reports: true,
			news_developer: true,
			scheduled_updates: true,
		} );

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		const subscribeAllToggle = await screen.findAllByRole( 'checkbox', {
			name: 'Subscribe to all',
		} );

		await userEvent.click( subscribeAllToggle[ 0 ] );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( 'Subscriptions settings saved.' );
		} );
	} );

	it( 'disables controls while saving', async () => {
		mockGetNotificationSettingsApi();
		// Don't mock the save API to simulate a pending request
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/notifications/settings' )
			.delay( 1000 ) // Simulate slow response
			.reply( 200, { wpcom: { marketing: true } } );

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
			expect( wpcomSuggestions ).toBeEnabled();
		} );

		// Click a toggle to trigger save
		const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
		await userEvent.click( wpcomSuggestions );

		// Controls should be disabled while saving
		await waitFor( () => {
			expect( wpcomSuggestions ).toBeDisabled();
			expect( screen.getAllByLabelText( 'Research' )[ 0 ] ).toBeDisabled();
		} );
	} );

	it( 'shows error message when save fails', async () => {
		mockGetNotificationSettingsApi();
		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/notifications/settings' )
			.reply( 500, { error: 'Internal server error' } );

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
			expect( wpcomSuggestions ).toBeEnabled();
		} );

		// Click a toggle to trigger save
		const wpcomSuggestions = screen.getAllByLabelText( 'Suggestions' )[ 0 ];
		await userEvent.click( wpcomSuggestions );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( 'Failed to save subscription settings.' );
		} );
	} );
} );
