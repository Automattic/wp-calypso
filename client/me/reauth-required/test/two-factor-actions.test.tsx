/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TwoFactorActions from '../two-factor-actions';

const mockDispatch = jest.fn();

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

// Mock dispatched Redux actions, since in reality these are implemented as a thunk, but we're
// primarily interested in testing whether the action was dispatched at all.
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEventWithClientId: ( event: string ) => ( {
		type: 'MOCK_TRACKS_EVENT',
		event,
	} ),
} ) );

describe( 'TwoFactorActions', () => {
	const onChange = jest.fn();
	const defaultProps = {
		isAuthenticatorSupported: true,
		isSecurityKeySupported: true,
		isSmsSupported: true,
		isSmsAllowed: true,
		onChange,
		twoFactorAuthType: 'authenticator',
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should render buttons based on available 2FA methods', () => {
		const { getByText, queryByText } = render( <TwoFactorActions { ...defaultProps } /> );

		// Security key button should be available when isSecurityKeySupported is true and current
		// auth type is not security key
		expect( getByText( 'Continue with your security key' ) ).toBeTruthy();

		// Authenticator button should not be available when current auth type is authenticator
		expect( queryByText( 'Continue with your authenticator app' ) ).toBeNull();

		// SMS button should be available when isSmsSupported is true
		expect( getByText( 'Send code via text message' ) ).toBeTruthy();
	} );

	test( 'should not render authenticator button when already using authenticator', () => {
		const { queryByText } = render(
			<TwoFactorActions { ...defaultProps } twoFactorAuthType="authenticator" />
		);

		expect( queryByText( 'Continue with your authenticator app' ) ).toBeNull();
	} );

	test( 'should not render security key button when already using security key', () => {
		const { queryByText } = render(
			<TwoFactorActions { ...defaultProps } twoFactorAuthType="webauthn" />
		);

		expect( queryByText( 'Continue with your security key' ) ).toBeNull();
	} );

	test( 'should disable SMS button when isSmsAllowed is false', () => {
		const { getByText } = render( <TwoFactorActions { ...defaultProps } isSmsAllowed={ false } /> );

		const smsButton = getByText( 'Send code via text message' );
		expect( smsButton ).toBeTruthy();

		const buttonElement = smsButton.closest( 'button' )!;
		expect( buttonElement.disabled ).toBe( true );
	} );

	test( 'should not render any buttons when no methods are available', () => {
		const { container } = render(
			<TwoFactorActions
				{ ...defaultProps }
				isAuthenticatorSupported={ false }
				isSecurityKeySupported={ false }
				isSmsSupported={ false }
			/>
		);

		expect( container.firstChild ).toBeNull();
	} );

	test( 'should call onChange with correct auth type when security key button is clicked', async () => {
		const { getByText } = render( <TwoFactorActions { ...defaultProps } /> );

		const securityKeyButton = getByText( 'Continue with your security key' );
		await userEvent.click( securityKeyButton );

		expect( onChange ).toHaveBeenCalledWith( 'webauthn' );
		expect( mockDispatch ).toHaveBeenCalledWith( {
			type: 'MOCK_TRACKS_EVENT',
			event: 'calypso_twostep_reauth_webauthn_clicked',
		} );
	} );

	test( 'should call onChange with correct auth type when SMS button is clicked', async () => {
		const { getByText } = render( <TwoFactorActions { ...defaultProps } /> );

		const smsButton = getByText( 'Send code via text message' );
		await userEvent.click( smsButton );

		expect( onChange ).toHaveBeenCalledWith( 'sms' );
		expect( mockDispatch ).toHaveBeenCalledWith( {
			type: 'MOCK_TRACKS_EVENT',
			event: 'calypso_twostep_reauth_sms_clicked',
		} );
	} );

	test( 'should call onChange with correct auth type when authenticator button is clicked', async () => {
		const { getByText } = render(
			<TwoFactorActions { ...defaultProps } twoFactorAuthType="sms" />
		);

		const authenticatorButton = getByText( 'Continue with your authenticator app' );
		await userEvent.click( authenticatorButton );

		expect( onChange ).toHaveBeenCalledWith( 'authenticator' );
		expect( mockDispatch ).toHaveBeenCalledWith( {
			type: 'MOCK_TRACKS_EVENT',
			event: 'calypso_twostep_reauth_authenticator_clicked',
		} );
	} );
} );
