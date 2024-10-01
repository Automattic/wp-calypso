/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { combineReducers } from 'redux';
import { createReduxStore } from 'calypso/state';
import currentUser from 'calypso/state/current-user/reducer';
import userSettings from 'calypso/state/user-settings/reducer';
import EmailVerificationBanner from '../index.tsx';

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn( () => {} ) );

function createTestStore( verified, pending = false ) {
	return createReduxStore(
		{
			currentUser: {
				user: {
					email_verified: verified,
				},
			},
			userSettings: {
				settings: {
					new_user_email: pending && 'test@email.com',
				},
			},
		},
		combineReducers( { userSettings, currentUser } )
	);
}

describe( 'EmailNotVerifiedNotice', () => {
	it( 'does not show the notice if already verified', () => {
		render(
			<ReduxProvider store={ createTestStore( true ) }>
				<EmailVerificationBanner />
			</ReduxProvider>
		);
		expect(
			screen.queryByText(
				/Verifying your email helps you secure your WordPress.com account and enables key features./
			)
		).toBeNull();
	} );

	it( 'shows the notice if not verified', () => {
		render(
			<ReduxProvider store={ createTestStore( false ) }>
				<EmailVerificationBanner />
			</ReduxProvider>
		);
		expect(
			screen.queryByText(
				/Verifying your email helps you secure your WordPress.com account and enables key features./
			)
		).toBeInTheDocument();
	} );

	it( 'shows the notice if email change is pending', () => {
		render(
			<ReduxProvider store={ createTestStore( true, true ) }>
				<EmailVerificationBanner />
			</ReduxProvider>
		);
		expect(
			screen.queryByText(
				/Verifying your email helps you secure your WordPress.com account and enables key features./
			)
		).toBeInTheDocument();
	} );

	it( 'opens the dialog when clicked', async () => {
		render(
			<ReduxProvider store={ createTestStore( false ) }>
				<EmailVerificationBanner />
			</ReduxProvider>
		);
		await screen.getByText( 'Verify email' ).click();
		// Check for dialog modal copy to ensure it appeared.
		expect(
			screen.queryByText( /Verify your email to secure your account and access more features./ )
		).toBeInTheDocument();
	} );
} );
