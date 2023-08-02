/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as ReduxProvider } from 'react-redux';
import * as calypsoState from 'calypso/state';
import { createReduxStore } from 'calypso/state';
import * as sendEmail from '../../../landing/stepper/hooks/use-send-email-verification';
import EmailNotVerifiedNotice from '../email-not-verified-notice';

describe( 'EmailNotVerifiedNotice', () => {
	it( 'does not show the notice if already verified', () => {
		render(
			<ReduxProvider store={ createTestStore( true ) }>
				<EmailNotVerifiedNotice />
			</ReduxProvider>
		);
		expect( screen.queryByText( /Your email has not been verified yet/ ) ).toBeNull();
	} );

	it( 'shows the notice if not verified', () => {
		render(
			<ReduxProvider store={ createTestStore( false ) }>
				<EmailNotVerifiedNotice />
			</ReduxProvider>
		);
		expect( screen.queryByText( /Your email has not been verified yet/ ) ).toBeInTheDocument();
	} );

	it( 'fires success notice action when resend is successful', async () => {
		const dispatch = jest.fn();

		jest.spyOn( calypsoState, 'useDispatch' ).mockReturnValue( dispatch );

		const useSendEmailVerification = jest.spyOn( sendEmail, 'useSendEmailVerification' );
		useSendEmailVerification.mockImplementation( () => () => {
			return Promise.resolve( {
				success: true,
			} );
		} );

		render(
			<ReduxProvider store={ createTestStore( false ) }>
				<EmailNotVerifiedNotice />
			</ReduxProvider>
		);

		const resendButton = screen.getByText( 'Resend email' );
		await userEvent.click( resendButton );

		expect( useSendEmailVerification ).toHaveBeenCalled();
		await waitFor( () => {
			expect(
				dispatch.mock.calls[ 0 ][ 0 ].notice.text.includes(
					'Verification email resent. Please check your inbox.'
				)
			).toBeTruthy();
		} );
	} );

	it( 'fires error notice action when resend is unsuccessful', async () => {
		const dispatch = jest.fn();

		jest.spyOn( calypsoState, 'useDispatch' ).mockReturnValue( dispatch );

		const useSendEmailVerification = jest.spyOn( sendEmail, 'useSendEmailVerification' );
		useSendEmailVerification.mockImplementation( () => () => {
			return Promise.reject();
		} );

		render(
			<ReduxProvider store={ createTestStore( false ) }>
				<EmailNotVerifiedNotice />
			</ReduxProvider>
		);

		const resendButton = screen.getByText( 'Resend email' );
		await userEvent.click( resendButton );

		expect( useSendEmailVerification ).toHaveBeenCalled();

		await waitFor( () => {
			expect(
				dispatch.mock.calls[ 0 ][ 0 ].notice.text.includes(
					"Couldn't resend verification email. Please try again."
				)
			).toBeTruthy();
		} );
	} );
} );

function createTestStore( verified ) {
	return createReduxStore( {
		currentUser: {
			user: {
				email_verified: verified,
			},
		},
	} );
}
