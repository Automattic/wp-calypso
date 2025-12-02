/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { PropsWithChildren, Suspense } from 'react';
import Snackbars from '../../../../app/snackbars';
import { PauseAllEmails } from '../index';

const notificationSnackBar = () => {
	//Snackbar requires a custom matcher because it's aria-live is not supported by the testing library
	return document.getElementById( 'a11y-speak-polite' );
};

const confirmationModal = () => {
	return screen.queryByRole( 'dialog', { name: /Pause all emails\?/ } );
};
const saveButton = () => {
	return screen.findByRole( 'button', { name: /Save/ } );
};
const cancelButton = () => {
	return screen.findByRole( 'button', { name: /Cancel/ } );
};
const confirmButton = () => {
	return screen.findByRole( 'button', { name: /Yes, I want to pause all emails/ } );
};

const pauseCheckbox = () => {
	return screen.findByRole( 'checkbox', { name: /Pause all emails/ } );
};

describe( 'PauseAllEmails', () => {
	beforeAll( () => {
		nock.disableNetConnect();
		nock.cleanAll();
		// Snackbar component requires it to work and jest doesn't mock it
		window.scrollTo = jest.fn();
	} );

	const Wrapper = ( { children }: PropsWithChildren ) => {
		const queryClient = new QueryClient();
		return (
			<QueryClientProvider client={ queryClient }>
				<Snackbars />
				<Suspense>{ children }</Suspense>
			</QueryClientProvider>
		);
	};

	it( 'renders unchecked when all emails are not blocked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: false,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper } );

		await waitFor( async () => {
			expect( await pauseCheckbox() ).not.toBeChecked();
		} );
	} );

	it( 'renders checked when all emails are blocked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: true,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper } );
		expect( await pauseCheckbox() ).toBeChecked();
	} );

	it( 'cancels the change when the cancel button is clicked', async () => {
		nock( 'https://public-api.wordpress.com:443' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
			subscription_delivery_email_blocked: false,
		} );

		render( <PauseAllEmails />, { wrapper: Wrapper } );
		await userEvent.click( await pauseCheckbox() );
		await userEvent.click( await saveButton() );

		await waitFor( async () => {
			expect( confirmationModal() ).toBeVisible();
		} );

		await userEvent.click( await cancelButton() );

		await waitFor( async () => {
			expect( confirmationModal() ).not.toBeInTheDocument();
		} );

		expect( await pauseCheckbox() ).not.toBeChecked();
	} );

	it( 'shows confirmation message when the user blocks all emails are paused', async () => {
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

		render( <PauseAllEmails />, { wrapper: Wrapper } );

		await userEvent.click( await pauseCheckbox() );
		await userEvent.click( await saveButton() );

		expect( await confirmationModal() ).toBeVisible();

		await userEvent.click( await confirmButton() );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
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

		render( <PauseAllEmails />, { wrapper: Wrapper } );

		await userEvent.click( await pauseCheckbox() );
		await userEvent.click( await saveButton() );

		await waitFor( () => {
			const snackbar = notificationSnackBar();
			expect( snackbar ).toBeVisible();
			expect( snackbar ).toHaveTextContent( /All emails unpaused/ );
		} );
	} );
} );
