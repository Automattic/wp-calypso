/**
 * @jest-environment jsdom
 */
import { act, render, renderHook, screen } from '@testing-library/react';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { useBlackboxProtection } from '../use-blackbox-protection';
import type { BlackboxState } from 'calypso/types';

jest.mock( '../utils/blackbox-sdk', () => ( {
	...jest.requireActual( '../utils/blackbox-sdk' ),
	loadBlackboxSdk: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		if ( key === 'blackbox_signup_api_key' ) {
			return 'signup-key';
		}
		if ( key === 'blackbox_api_key' ) {
			return 'login-key';
		}
		return undefined;
	};
	config.isEnabled = jest.fn( () => true );
	return config;
} );

describe( 'useBlackboxProtection resetOnError', () => {
	let sdk: { setState: ( state: BlackboxState ) => void };
	let reset: jest.Mock;

	beforeEach( () => {
		jest.useFakeTimers();
		let snapshot: BlackboxState = { status: 'ready', sessionId: 'sid' };
		const listeners = new Set< ( state: BlackboxState ) => void >();
		sdk = {
			setState: ( state ) => {
				snapshot = Object.freeze( state );
				listeners.forEach( ( listener ) => listener( snapshot ) );
			},
		};
		reset = jest.fn( () => sdk.setState( { status: 'loading' } ) );
		window.Blackbox = {
			configure: jest.fn(),
			reset,
			flush: jest.fn(),
			getSnapshot: () => snapshot,
			subscribe: ( listener ) => {
				listeners.add( listener );
				listener( snapshot );
				return () => {
					listeners.delete( listener );
				};
			},
			collect: jest.fn(),
			getSessionId: jest.fn(),
		};
		( getBlackboxSessionId as jest.Mock ).mockReset();
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( undefined );
	} );

	afterEach( () => {
		delete window.Blackbox;
		jest.useRealTimers();
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

	it( 'resets the session when an active form receives a failed redeem', async () => {
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: { code: 403 } } );
		await act( async () => {} );

		expect( reset ).toHaveBeenCalledTimes( 1 );
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();
	} );

	it( 'keeps the session while protection is suspended', () => {
		const { rerender } = renderProtection( { resetOnError: null, suspended: true } );

		rerender( { resetOnError: { code: 403 }, suspended: true } );

		expect( reset ).not.toHaveBeenCalled();
	} );

	it( 'resets once while the same failure stays on the form', async () => {
		const error = { code: 403 };
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: error } );
		rerender( { resetOnError: error } );
		await act( async () => {} );

		expect( reset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'resets again after a later redeem fails', async () => {
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: { code: 403 } } );
		await act( async () => {} );
		rerender( { resetOnError: null } );
		rerender( { resetOnError: { code: 429 } } );
		await act( async () => {} );

		expect( reset ).toHaveBeenCalledTimes( 2 );
	} );

	function ContinueButton( { resetOnError }: { resetOnError: { code: number } | null } ) {
		const { challenge, isSubmitBlocked } = useBlackboxProtection( {
			feature: 'blackbox-signup',
			resetOnError,
		} );

		return (
			<>
				{ challenge }
				<button type="submit" disabled={ isSubmitBlocked }>
					Continue
				</button>
			</>
		);
	}

	it( 'blocks replacement loading and enables submit when the session is ready', async () => {
		const { rerender } = render( <ContinueButton resetOnError={ null } /> );
		await act( async () => {} );
		expect( screen.getByRole( 'button' ) ).toBeEnabled();

		rerender( <ContinueButton resetOnError={ { code: 403 } } /> );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();

		act( () => sdk.setState( { status: 'ready', sessionId: 'replacement' } ) );
		expect( screen.getByRole( 'button' ) ).toBeEnabled();
	} );

	it( 'keeps submit blocked until the replacement challenge ends', async () => {
		const { rerender } = render( <ContinueButton resetOnError={ null } /> );
		await act( async () => {} );
		rerender( <ContinueButton resetOnError={ { code: 403 } } /> );

		act( () => sdk.setState( { status: 'challenge', sessionId: 'replacement' } ) );
		act( () => jest.advanceTimersByTime( 5000 ) );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();

		act( () => sdk.setState( { status: 'ready', sessionId: 'replacement' } ) );
		expect( screen.getByRole( 'button' ) ).toBeEnabled();
	} );

	it( 'enables submit after the replacement loading deadline', async () => {
		const { rerender } = render( <ContinueButton resetOnError={ null } /> );
		await act( async () => {} );
		rerender( <ContinueButton resetOnError={ { code: 403 } } /> );

		act( () => jest.advanceTimersByTime( 4999 ) );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
		act( () => jest.advanceTimersByTime( 1 ) );
		expect( screen.getByRole( 'button' ) ).toBeEnabled();
	} );
} );
