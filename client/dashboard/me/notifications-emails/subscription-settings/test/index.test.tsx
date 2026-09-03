/**
 * @jest-environment jsdom
 */
import { UserSettings } from '@automattic/api-core';
import {
	fromUtcDeliveryWindow,
	getDeliveryWindowOffsetHours,
	toUtcDeliveryWindow,
	useDeliveryWindowTimezone,
} from '@automattic/i18n-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Suspense } from 'react';
import Snackbars from '../../../../app/snackbars';
import { SubscriptionSettings } from '../index';

//Required to prevent the inline support link from being rendered in the test
jest.mock(
	'../../../../components/inline-support-link',
	() =>
		( { children }: { children: React.ReactNode } ) => <span>{ children }</span>
);

jest.mock( '@tanstack/react-router' );

// Mock only the timezone hook so we can drive the UTC↔local delivery-window
// conversion deterministically, without depending on the machine's real time
// zone. The conversion helpers themselves stay real.
jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	useDeliveryWindowTimezone: jest.fn(),
} ) );

const mockGetIsAutomatticianApi = ( isAutomttician: boolean ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.2/read/teams' )
		.reply( 200, {
			number: isAutomttician ? 1 : 0,
			teams: isAutomttician ? [ { slug: 'a8c', title: 'Automatticians' } ] : [],
		} );
};

const defaultUserSettings: Partial< UserSettings > = {
	subscription_delivery_email_default: 'daily',
	subscription_delivery_jabber_default: false,
	subscription_delivery_mail_option: 'html',
	subscription_delivery_day: 1,
	subscription_delivery_hour: 8,
	p2_disable_autofollow_on_comment: false,
};

const mockGetSettingsApi = ( settings: Partial< UserSettings > = defaultUserSettings ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/me/settings' )
		.reply( 200, settings );
};

const mockSaveSettingsApi = ( expectedSettings: Partial< UserSettings > ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/me/settings' )
		.reply( 200, expectedSettings );
};

const notificationSnackBar = () => {
	//Snackbar requires a custom matcher because it's aria-live is not supported by the testing library
	return document.getElementById( 'a11y-speak-polite' );
};

const saveButton = () => {
	return screen.findByRole( 'button', { name: 'Save' } );
};

const defaultEmailDeliverySelect = () => {
	return screen.findByRole( 'combobox', { name: 'Default email delivery' } );
};

const emailDeliveryFormatSelect = () => {
	return screen.findByRole( 'combobox', { name: 'Email delivery format' } );
};

const daySelect = () => {
	return screen.findByRole( 'combobox', { name: 'Day' } );
};

const hourSelect = () => {
	return screen.findByRole( 'combobox', { name: 'Hour' } );
};

const jabberSubscriptionDeliveryCheckbox = () => {
	return screen.findByRole( 'checkbox', { name: 'Jabber subscription delivery' } );
};

const automatticiansOnlyCheckbox = () => {
	return screen.queryByLabelText(
		'Automatically subscribe to P2 post notifications when you leave a comment'
	);
};

describe( 'SubscriptionSettings', () => {
	const Wrapper =
		( client: QueryClient = new QueryClient() ) =>
		( { children }: { children: React.ReactNode } ) => {
			return (
				<QueryClientProvider client={ client }>
					<Snackbars />
					<Suspense>{ children }</Suspense>
				</QueryClientProvider>
			);
		};

	beforeEach( () => {
		//Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
		// Default to UTC so the existing tests keep their identity behavior.
		( useDeliveryWindowTimezone as jest.Mock ).mockReturnValue( {
			timezone: 'UTC',
			offsetHours: 0,
			isUtcFallback: false,
		} );
	} );

	it( "doesn't render the automatticians only checkbox", async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		expect( await saveButton() ).toBeVisible();

		expect(
			screen.queryByLabelText(
				/Automatically subscribe to P2 post notifications when you leave a comment./
			)
		).not.toBeInTheDocument();
	} );

	it( 'starts with button disabled', async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		expect( await saveButton() ).toBeDisabled();
	} );

	it( 'enables the save button when any setting is changed', async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await userEvent.selectOptions( await defaultEmailDeliverySelect(), 'weekly' );

		expect( await saveButton() ).toBeEnabled();
	} );

	it( 'renders the automatticians only checkbox', async () => {
		nock.cleanAll();

		mockGetIsAutomatticianApi( true );
		mockGetSettingsApi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await waitFor( () => {
			expect( automatticiansOnlyCheckbox() ).toBeVisible();
		} );
	} );

	it( 'shows the current settings', async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi( {
			subscription_delivery_email_default: 'weekly',
			subscription_delivery_jabber_default: false,
			subscription_delivery_mail_option: 'html',
			subscription_delivery_day: 2,
			subscription_delivery_hour: 10,
		} );

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		expect( await defaultEmailDeliverySelect() ).toHaveValue( 'weekly' );
		expect( await emailDeliveryFormatSelect() ).toHaveValue( 'html' );
		expect( await daySelect() ).toHaveValue( '2' );
		expect( await hourSelect() ).toHaveValue( '10' );
		expect( await jabberSubscriptionDeliveryCheckbox() ).not.toBeChecked();
	} );

	it( 'updates the settings on submit', async () => {
		const currentValues = {
			subscription_delivery_email_default: 'weekly',
			subscription_delivery_jabber_default: false,
			subscription_delivery_mail_option: 'html',
			subscription_delivery_day: 2,
			subscription_delivery_hour: 10,
		};
		const newValues = {
			subscription_delivery_email_default: 'daily',
			subscription_delivery_jabber_default: true,
			subscription_delivery_mail_option: 'text',
			subscription_delivery_day: 1,
			subscription_delivery_hour: 9,
		};
		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi( currentValues );
		mockSaveSettingsApi( newValues );

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await userEvent.selectOptions( await defaultEmailDeliverySelect(), 'daily' );
		await userEvent.selectOptions( await emailDeliveryFormatSelect(), 'text' );
		await userEvent.selectOptions( await daySelect(), '1' );
		await userEvent.selectOptions( await hourSelect(), '10' );
		await userEvent.click( await jabberSubscriptionDeliveryCheckbox() );
		await userEvent.click( await saveButton() );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( 'Subscription settings saved.' );
		} );
	} );

	it( 'displays the stored UTC window in local time and saves edits back as UTC', async () => {
		// Evaluate the offset the same way the hook would, so the test stays
		// correct across daylight-saving transitions.
		const offsetHours = getDeliveryWindowOffsetHours( 'America/Los_Angeles' ) ?? 0;
		( useDeliveryWindowTimezone as jest.Mock ).mockReturnValue( {
			timezone: 'America/Los_Angeles',
			offsetHours,
			isUtcFallback: false,
		} );
		const expectedLocal = fromUtcDeliveryWindow( { hour: 0, day: 1 }, offsetHours );

		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi( {
			...defaultUserSettings,
			subscription_delivery_day: 1,
			subscription_delivery_hour: 0,
		} );

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		// UTC Monday 00:00 should show as the previous-day local bucket in PT.
		expect( await daySelect() ).toHaveValue( String( expectedLocal.day ) );
		expect( await hourSelect() ).toHaveValue( String( expectedLocal.hour ) );

		// Pick a different local bucket and verify it round-trips back to UTC.
		const newLocalHour = expectedLocal.hour === 0 ? 2 : 0;
		const expectedUtc = toUtcDeliveryWindow(
			{ hour: newLocalHour, day: expectedLocal.day },
			offsetHours
		);

		nock( 'https://public-api.wordpress.com:443' )
			.post(
				'/rest/v1.1/me/settings',
				( body ) =>
					Number( body.subscription_delivery_hour ) === expectedUtc.hour &&
					Number( body.subscription_delivery_day ) === expectedUtc.day
			)
			.reply( 200, {} );

		await userEvent.selectOptions( await hourSelect(), String( newLocalHour ) );
		await userEvent.click( await saveButton() );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( 'Subscription settings saved.' );
		} );
	} );

	it( 'falls back to clearly labeled UTC when the time zone is unknown', async () => {
		( useDeliveryWindowTimezone as jest.Mock ).mockReturnValue( {
			timezone: undefined,
			offsetHours: null,
			isUtcFallback: true,
		} );

		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi( {
			...defaultUserSettings,
			subscription_delivery_day: 1,
			subscription_delivery_hour: 8,
		} );

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		// With no time zone, values are shown unchanged (raw UTC).
		expect( await hourSelect() ).toHaveValue( '8' );
		// The UTC fallback description and option labels should be present.
		expect( await screen.findByText( /Timezone:\s*UTC/i ) ).toBeVisible();
		expect( screen.getByRole( 'option', { name: '08:00 - 10:00 UTC' } ) ).toBeInTheDocument();
	} );

	it( 'preserves an odd stored UTC hour when only the day changes in UTC fallback mode', async () => {
		( useDeliveryWindowTimezone as jest.Mock ).mockReturnValue( {
			timezone: undefined,
			offsetHours: null,
			isUtcFallback: true,
		} );

		mockGetIsAutomatticianApi( false );
		mockGetSettingsApi( {
			...defaultUserSettings,
			subscription_delivery_day: 1,
			subscription_delivery_hour: 5,
		} );

		nock( 'https://public-api.wordpress.com:443' )
			.post(
				'/rest/v1.1/me/settings',
				( body ) =>
					Number( body.subscription_delivery_hour ) === 5 &&
					Number( body.subscription_delivery_day ) === 2
			)
			.reply( 200, {} );

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		expect( await hourSelect() ).toHaveValue( '5' );
		expect( screen.getByRole( 'option', { name: '05:00 - 07:00 UTC' } ) ).toBeInTheDocument();

		expect( await daySelect() ).toHaveValue( '1' );

		await userEvent.selectOptions( await daySelect(), '2' );
		await userEvent.click( await saveButton() );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( 'Subscription settings saved.' );
		} );
	} );
} );
