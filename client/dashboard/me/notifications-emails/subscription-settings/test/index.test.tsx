/**
 * @jest-environment jsdom
 */
import { UserSettings } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Suspense } from 'react';
import { useNotice } from '../../../../app/hooks/use-notice';
import { SubscriptionSettings } from '../index';

//Required to prevent the inline support link from being rendered in the test
jest.mock(
	'../../../../components/inline-support-link',
	() =>
		( { children }: { children: React.ReactNode } ) => <span>{ children }</span>
);

jest.mock( '../../../../app/hooks/use-notice', () => ( {
	useNotice: jest.fn().mockReturnValue( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ),
} ) );

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

const mockGetSettingsAPi = ( settings: Partial< UserSettings > = defaultUserSettings ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/me/settings' )
		.reply( 200, settings );
};

const mockSaveSettingsAPi = ( expectedSettings: Partial< UserSettings > ) => {
	return nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/me/settings' )
		.reply( 200, expectedSettings );
};

describe( 'SubscriptionSettings', () => {
	const Wrapper =
		( client: QueryClient = new QueryClient() ) =>
		( { children }: { children: React.ReactNode } ) => {
			return (
				<QueryClientProvider client={ client }>
					<Suspense>{ children }</Suspense>
				</QueryClientProvider>
			);
		};

	beforeEach( () => {
		nock.disableNetConnect();
		nock.cleanAll();
	} );

	it( "doesn't render the automatticians only checkbox", async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsAPi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await waitFor( () => {
			expect(
				screen.queryByRole( 'button', {
					name: 'Save',
				} )
			).toBeVisible();
		} );

		expect(
			screen.queryByLabelText(
				/Automatically subscribe to P2 post notifications when you leave a comment./
			)
		).not.toBeInTheDocument();
	} );

	it( 'starts with button disabled', async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsAPi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
		} );
	} );

	it( 'enables the save button when any setting is changed', async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsAPi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await userEvent.selectOptions(
			await screen.findByLabelText( 'Default email delivery' ),
			'weekly'
		);

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeEnabled();
		} );
	} );

	it( 'renders the automatticians only checkbox', async () => {
		nock.cleanAll();

		mockGetIsAutomatticianApi( true );
		mockGetSettingsAPi();

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await waitFor( () => {
			expect(
				screen.queryByLabelText(
					/Automatically subscribe to P2 post notifications when you leave a comment./
				)
			).toBeVisible();
		} );
	} );

	it( 'shows the current settings', async () => {
		mockGetIsAutomatticianApi( false );
		mockGetSettingsAPi( {
			subscription_delivery_email_default: 'weekly',
			subscription_delivery_jabber_default: false,
			subscription_delivery_mail_option: 'html',
			subscription_delivery_day: 2,
			subscription_delivery_hour: 10,
		} );

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await waitFor( () => {
			expect( screen.getByLabelText( 'Default email delivery' ) ).toHaveValue( 'weekly' );
			expect( screen.getByLabelText( 'Email delivery format' ) ).toHaveValue( 'html' );
			expect( screen.getByLabelText( 'Day' ) ).toHaveValue( '2' );
			expect( screen.getByLabelText( 'Hour' ) ).toHaveValue( '10' );
			expect( screen.getByLabelText( 'Jabber subscription delivery' ) ).not.toBeChecked();
		} );
	} );

	it( 'updates the settings on submit', async () => {
		const createSuccessNotice = jest.fn();
		const createErrorNotice = jest.fn();

		jest.mocked( useNotice ).mockReturnValue( {
			createSuccessNotice,
			createErrorNotice,
		} as unknown as ReturnType< typeof useNotice > );

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

		mockGetSettingsAPi( currentValues );

		const saveSettingsApi = mockSaveSettingsAPi( newValues );

		render( <SubscriptionSettings />, { wrapper: Wrapper() } );

		await userEvent.selectOptions(
			await screen.findByLabelText( 'Default email delivery' ),
			'daily'
		);
		await userEvent.selectOptions(
			await screen.findByLabelText( 'Email delivery format' ),
			'text'
		);
		await userEvent.selectOptions( await screen.findByLabelText( 'Day' ), '1' );
		await userEvent.selectOptions( await screen.findByLabelText( 'Hour' ), '10' );
		await userEvent.click( await screen.findByLabelText( 'Jabber subscription delivery' ) );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect( saveSettingsApi.isDone() ).toBe( true );
			expect( createSuccessNotice ).toHaveBeenCalledWith( 'Settings saved successfully.', {
				type: 'snackbar',
			} );
		} );
	} );
} );
