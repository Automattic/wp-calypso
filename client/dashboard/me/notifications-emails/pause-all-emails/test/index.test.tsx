/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { PropsWithChildren, Suspense } from 'react';
import Snackbars from '../../../../app/snackbars';
import { PauseAllEmails } from '../index';

describe( 'PauseAllEmails', () => {
	beforeAll( () => {
		nock.disableNetConnect();
		nock.cleanAll();
		window.scrollTo = jest.fn();
	} );

	const Wrapper =
		( queryClient = new QueryClient() ) =>
		( { children }: PropsWithChildren ) => {
			return (
				<QueryClientProvider client={ queryClient }>
					<Snackbars />
					<Suspense>{ children }</Suspense>
				</QueryClientProvider>
			);
		};

	const getSnackbar = () => {
		//Snackbar requires a custom matcher because it's aria-live is not supported by the testing library
		return document.getElementById( 'a11y-speak-polite' );
	};

	it( 'renders unchecked when all emails are not blocked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: false,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );

		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: /Pause all emails/ } ) ).not.toBeChecked();
		} );
	} );

	it( 'renders checked when all emails are blocked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: true,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );
		await waitFor( () => {
			expect( screen.getByRole( 'checkbox', { name: /Pause all emails/ } ) ).toBeChecked();
		} );
	} );

	it( 'cancels the change when the cancel button is clicked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: false,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );
		await userEvent.click( await screen.findByRole( 'checkbox', { name: /Pause all emails/ } ) );
		await userEvent.click( await screen.getByRole( 'button', { name: /Save/ } ) );

		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: /Pause all emails\?/ } ) ).toBeInTheDocument();
		} );

		await userEvent.click( screen.getByRole( 'button', { name: /Cancel/ } ) );
		expect(
			screen.queryByText( /Are you sure you want to pause all emails?/ )
		).not.toBeInTheDocument();
	} );

	it( 'shows confirmation message when the settings all emails are paused', async () => {
		const initialSettings = {
			subscription_delivery_email_blocked: false,
		};
		const updatedSettings = {
			subscription_delivery_email_blocked: true,
		};

		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/me/settings' )
			.reply( 200, initialSettings );

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/settings' )
			.reply( 200, updatedSettings );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );

		await userEvent.click( await screen.findByRole( 'checkbox', { name: /Pause all emails/ } ) );
		await userEvent.click( await screen.getByRole( 'button', { name: /Save/ } ) );

		expect( await screen.findByText( /Pause all emails\?/ ) ).toBeVisible();

		await userEvent.click(
			screen.getByRole( 'button', { name: /Yes, I want to pause all emails/ } )
		);

		await waitFor( () => {
			const snackbar = getSnackbar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( /All emails paused/ );
		} );
	} );

	it( 'shows confirmation message when the settings all emails are unpaused', async () => {
		const initialSettings = {
			subscription_delivery_email_blocked: true,
		};
		const updatedSettings = {
			subscription_delivery_email_blocked: false,
		};

		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/me/settings' )
			.reply( 200, initialSettings );

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.1/me/settings' )
			.reply( 200, updatedSettings );

		render( <PauseAllEmails />, { wrapper: Wrapper() } );

		await userEvent.click( await screen.findByRole( 'checkbox', { name: /Pause all emails/ } ) );
		await userEvent.click( await screen.getByRole( 'button', { name: /Save/ } ) );

		await waitFor( () => {
			const snackbar = getSnackbar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( /All emails unpaused/ );
		} );
	} );
} );
