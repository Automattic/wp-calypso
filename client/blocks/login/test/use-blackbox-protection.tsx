/**
 * @vitest-environment jsdom
 */
import { act, render, renderHook, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { useBlackboxProtection } from '../use-blackbox-protection';
import type { BlackboxState } from 'calypso/types';

vi.mock( '../utils/blackbox-sdk', async () => ( {
	...( await vi.importActual< typeof import( '../utils/blackbox-sdk' ) >(
		'../utils/blackbox-sdk'
	) ),
	loadBlackboxSdk: vi.fn( () => Promise.resolve() ),
} ) );

vi.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: vi.fn().mockResolvedValue( undefined ),
} ) );

vi.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		if ( key === 'blackbox_api_key' ) {
			return 'login-key';
		}
		return undefined;
	};
	config.isEnabled = vi.fn( () => true );
	return { ...config, default: config };
} );

describe( 'useBlackboxProtection resetOnError', () => {
	let sdk: { setState: ( state: BlackboxState ) => void };
	let reset: Mock;

	beforeEach( () => {
		vi.useFakeTimers();
		let snapshot: BlackboxState = { status: 'ready', sessionId: 'sid' };
		const listeners = new Set< ( state: BlackboxState ) => void >();
		sdk = {
			setState: ( state ) => {
				snapshot = Object.freeze( state );
				listeners.forEach( ( listener ) => listener( snapshot ) );
			},
		};
		reset = vi.fn( () => sdk.setState( { status: 'loading' } ) );
		window.Blackbox = {
			configure: vi.fn(),
			reset,
			flush: vi.fn(),
			getSnapshot: () => snapshot,
			subscribe: ( listener ) => {
				listeners.add( listener );
				listener( snapshot );
				return () => {
					listeners.delete( listener );
				};
			},
			collect: vi.fn(),
			getSessionId: vi.fn(),
		};
		( getBlackboxSessionId as Mock ).mockReset();
		( getBlackboxSessionId as Mock ).mockResolvedValue( undefined );
	} );

	afterEach( () => {
		delete window.Blackbox;
		vi.useRealTimers();
	} );

	function renderProtection( initialProps: {
		resetOnError: { code: number } | null;
		suspended?: boolean;
	} ) {
		return renderHook(
			( props: { resetOnError: { code: number } | null; suspended?: boolean } ) =>
				useBlackboxProtection( {
					feature: 'blackbox-signup',
					flow: 'signup',
					suspended: props.suspended,
					resetOnError: props.resetOnError,
				} ),
			{ initialProps }
		);
	}

	it( 'resets only the expected session after a response', async () => {
		const { result } = renderProtection( { resetOnError: null } );
		await act( async () => {} );
		act( () => result.current.reset( 'sid' ) );
		expect( reset ).toHaveBeenCalledTimes( 1 );
		act( () => result.current.reset( 'sid' ) );
		expect( reset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps a replacement session when an earlier response arrives', async () => {
		const { result } = renderProtection( { resetOnError: null } );
		await act( async () => {} );
		act( () => sdk.setState( { status: 'ready', sessionId: 'replacement' } ) );
		act( () => result.current.reset( 'sid' ) );
		expect( reset ).not.toHaveBeenCalled();
	} );

	it( 'ignores a response after its form unmounts', async () => {
		const { result, unmount } = renderProtection( { resetOnError: null } );
		await act( async () => {} );
		const resetAfterResponse = result.current.reset;
		unmount();
		resetAfterResponse( 'sid' );
		expect( reset ).not.toHaveBeenCalled();
	} );

	it( 'does not reset another active form even with the same session ID', async () => {
		const first = renderProtection( { resetOnError: null } );
		await act( async () => {} );
		renderProtection( { resetOnError: null } );
		await act( async () => {} );
		act( () => first.result.current.reset( 'sid' ) );
		expect( reset ).not.toHaveBeenCalled();
	} );

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
			flow: 'signup',
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
		act( () => vi.advanceTimersByTime( 5000 ) );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();

		act( () => sdk.setState( { status: 'ready', sessionId: 'replacement' } ) );
		expect( screen.getByRole( 'button' ) ).toBeEnabled();
	} );

	it( 'enables submit after the replacement loading deadline', async () => {
		const { rerender } = render( <ContinueButton resetOnError={ null } /> );
		await act( async () => {} );
		rerender( <ContinueButton resetOnError={ { code: 403 } } /> );

		act( () => vi.advanceTimersByTime( 4999 ) );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
		act( () => vi.advanceTimersByTime( 1 ) );
		expect( screen.getByRole( 'button' ) ).toBeEnabled();
	} );
} );

describe( 'useBlackboxProtection key', () => {
	beforeEach( () => {
		( getBlackboxSessionId as Mock ).mockReset();
		( getBlackboxSessionId as Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	it.each( [ 'login', 'signup' ] as const )(
		'collects the %s flow with the shared key',
		async ( flow ) => {
			const { result } = renderHook( () =>
				useBlackboxProtection( { feature: `blackbox-${ flow }`, flow } )
			);

			await result.current.getSessionId();

			expect( getBlackboxSessionId ).toHaveBeenCalledWith(
				'login-key',
				expect.any( AbortSignal ),
				flow
			);
		}
	);
} );
