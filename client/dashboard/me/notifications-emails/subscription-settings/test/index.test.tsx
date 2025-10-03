/**
 * @jest-environment jsdom
 */
import { UserSettings } from '@automattic/api-core';
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
		'Automatically subscribe to P2 post notifications when you leave a comment.'
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
		nock.disableNetConnect();
		nock.cleanAll();
		//Snackbar requires window.scrollTo to be defined
		window.scrollTo = jest.fn();
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
} );
