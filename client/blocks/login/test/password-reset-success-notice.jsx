/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import PasswordResetSuccessNotice from 'calypso/blocks/login/password-reset-success-notice';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const renderAtPath = ( initialPath ) =>
	renderWithProvider( <PasswordResetSuccessNotice />, { initialPath } );

describe( 'PasswordResetSuccessNotice', () => {
	test( 'shows the confirmation when password_reset is success', () => {
		renderAtPath( '/log-in?password_reset=success' );

		expect( screen.getByText( 'Your password has been reset successfully.' ) ).toBeInTheDocument();
	} );

	test( 'shows nothing when password_reset is absent', () => {
		const { container } = renderAtPath( '/log-in' );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'shows nothing when password_reset has another value', () => {
		const { container } = renderAtPath( '/log-in?password_reset=failure' );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
