/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../app/snackbars';
import { render as dashboardRender } from '../../../test-utils';
import NotificationsExtras from '../index';
import type { UserNotificationSettings, WpcomNotificationSettings } from '@automattic/api-core';

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
	blogs: {},
	other: {},
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
			expect( screen.getAllByLabelText( 'Suggestions' )[ 0 ] ).toBeVisible();
		} );

		// WordPress.com options
		expect( screen.getAllByLabelText( 'Suggestions' )[ 0 ] ).toBeVisible();
		expect( screen.getAllByLabelText( 'Research' )[ 0 ] ).toBeVisible();
		expect( screen.getByLabelText( 'Community' ) ).toBeVisible();
		expect( screen.getAllByLabelText( 'Promotions' )[ 0 ] ).toBeVisible();
		expect( screen.getAllByLabelText( 'Newsletter' )[ 0 ] ).toBeVisible();
		expect( screen.getByLabelText( 'Digests' ) ).toBeVisible();
		expect( screen.getAllByLabelText( 'Reports' )[ 0 ] ).toBeVisible();
		expect( screen.getByLabelText( 'Developer Newsletter' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Scheduled updates' ) ).toBeVisible();
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
			expect( screen.getAllByLabelText( 'Suggestions' ) ).toHaveLength( 2 ); // One for WordPress.com, one for Jetpack
		} );

		// Jetpack options (there should be 2 of each label - one for WordPress.com section, one for Jetpack section)
		expect( screen.getAllByLabelText( 'Suggestions' ) ).toHaveLength( 2 );
		expect( screen.getAllByLabelText( 'Research' ) ).toHaveLength( 2 );
		expect( screen.getAllByLabelText( 'Promotions' ) ).toHaveLength( 2 );
		expect( screen.getAllByLabelText( 'Newsletter' ) ).toHaveLength( 2 );
		expect( screen.getAllByLabelText( 'Reports' ) ).toHaveLength( 2 );
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

	it( 'shows "Subscribe to all" when no settings are enabled', async () => {
		// Start with all settings false
		mockGetNotificationSettingsApi();

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		// Initially, all settings are false, so both sections should show "Subscribe to all"
		await waitFor( () => {
			expect( screen.getAllByText( 'Subscribe to all' ) ).toHaveLength( 2 );
		} );
	} );

	it( 'shows "Unsubscribe from all" when at least one setting is enabled (WP)', async () => {
		// Start with one WordPress.com settings enabled
		const settingsWithWpcomEnabled: UserNotificationSettings = {
			...defaultUserSettings,
			wpcom: {
				...defaultWpcomSettings,
				marketing: true,
			},
		};

		mockGetNotificationSettingsApi( settingsWithWpcomEnabled );

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			// WordPress.com section should show "Unsubscribe from all" because all options are enabled
			expect( screen.getByRole( 'checkbox', { name: 'Unsubscribe from all' } ) ).toBeVisible();
			// Jetpack section should show "Subscribe to all" because no Jetpack options are enabled
			expect( screen.getByRole( 'checkbox', { name: 'Subscribe to all' } ) ).toBeVisible();
		} );
	} );

	it( 'shows "Unsubscribe from all" when at least one setting is enabled (Jetpack)', async () => {
		// Start with one Jetpack setting enabled
		const settingsWithWpcomEnabled: UserNotificationSettings = {
			...defaultUserSettings,
			wpcom: {
				...defaultWpcomSettings,
				jetpack_marketing: true,
			},
		};

		mockGetNotificationSettingsApi( settingsWithWpcomEnabled );

		dashboardRender(
			<>
				<Snackbars />
				<NotificationsExtras />
			</>
		);

		await waitFor( () => {
			// WordPress.com section should show "Subscribe to all" because all options are enabled
			expect( screen.getByRole( 'checkbox', { name: 'Subscribe to all' } ) ).toBeVisible();
			// Jetpack section should show "Unsubscribe from all" because no Jetpack options are enabled
			expect( screen.getByRole( 'checkbox', { name: 'Unsubscribe from all' } ) ).toBeVisible();
		} );
	} );

	it( 'shows snackbar notification on change', async () => {
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
			expect( snackbar ).toHaveTextContent( 'Subscription settings saved.' );
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
