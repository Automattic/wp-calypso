/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { PropsWithChildren } from 'react';
import { useNotice } from '../../hooks/use-notice';
import { PauseAllEmails } from '../index';

jest.mock( '../../hooks/use-notice', () => ( {
	useNotice: jest.fn().mockReturnValue( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ),
} ) );

describe( 'PauseAllEmails', () => {
	beforeAll( () => {
		nock.disableNetConnect();
		nock.cleanAll();
	} );
	const Wrapper =
		( queryClient = new QueryClient() ) =>
		( { children }: PropsWithChildren ) => {
			return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
		};

	it( 'renders unchecked when all emails are not not blocked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: false,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );

		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: /Pause All Emails/ } ) ).not.toBeChecked();
		} );
	} );

	it( 'renders checked when all emails are blocked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: true,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );
		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: /Pause All Emails/ } ) ).toBeChecked();
		} );
	} );

	it( 'updates the settings when the form is submitted', async () => {
		const createSuccessNotice = jest.fn();
		const initialSettings = {
			subscription_delivery_email_blocked: false,
		};
		const updatedSettings = {
			subscription_delivery_email_blocked: true,
		};

		( useNotice as jest.Mock ).mockReturnValue( {
			createSuccessNotice,
			createErrorNotice: jest.fn(),
		} );

		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/me/settings' )
			.reply( 200, initialSettings );

		const saveSettingsApi = nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/settings' )
			.reply( 200, updatedSettings );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );

		await userEvent.click( await screen.findByRole( 'checkbox', { name: /Pause All Emails/ } ) );
		await userEvent.click( await screen.getByRole( 'button', { name: /Save/ } ) );

		expect( await screen.findByText( /Are you sure you want to pause all emails?/ ) ).toBeVisible();

		await userEvent.click(
			screen.getByRole( 'button', { name: /Yes, I want to pause all emails/ } )
		);

		await waitFor( () => {
			expect( saveSettingsApi.isDone() ).toBe( true );
			expect( createSuccessNotice ).toHaveBeenCalledWith( 'All emails paused.', {
				type: 'snackbar',
			} );
			expect(
				screen.queryByText( /Are you sure you want to pause all emails?/ )
			).not.toBeInTheDocument();
		} );
	} );
} );
