/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useBlackboxProtection } from '../use-blackbox-protection';

jest.mock( '../blackbox-challenge', () => () => null );

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key: string ) => {
		if ( key === 'blackbox_signup_api_key' ) {
			return 'signup-key';
		}
		if ( key === 'blackbox_api_key' ) {
			return 'login-key';
		}
		return undefined;
	} );
	config.isEnabled = jest.fn( () => true );
	return config;
} );

describe( 'useBlackboxProtection resetOnError', () => {
	beforeEach( () => {
		window.Blackbox = { reset: jest.fn() };
	} );

	afterEach( () => {
		delete window.Blackbox;
	} );

	function renderProtection( initialProps: {
		resetOnError: { code: number } | null;
		suspended?: boolean;
	} ) {
		return renderHook(
			( props: { resetOnError: { code: number } | null; suspended?: boolean } ) =>
				useBlackboxProtection( {
					feature: 'blackbox-signup',
					suspended: props.suspended,
					resetOnError: props.resetOnError,
				} ),
			{ initialProps }
		);
	}

	it( 'resets the session when an active form receives a failed redeem', () => {
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: { code: 403 } } );

		expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the session while protection is suspended', () => {
		const { rerender } = renderProtection( { resetOnError: null, suspended: true } );

		rerender( { resetOnError: { code: 403 }, suspended: true } );

		expect( window.Blackbox.reset ).not.toHaveBeenCalled();
	} );

	it( 'resets once while the same failure stays on the form', () => {
		const error = { code: 403 };
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: error } );
		rerender( { resetOnError: error } );

		expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'resets again after a later redeem fails', () => {
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: { code: 403 } } );
		rerender( { resetOnError: null } );
		rerender( { resetOnError: { code: 429 } } );

		expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 2 );
	} );
} );
