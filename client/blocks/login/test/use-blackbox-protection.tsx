/**
 * @jest-environment jsdom
 */
import { act, render, renderHook, screen } from '@testing-library/react';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { useBlackboxProtection } from '../use-blackbox-protection';

let reportBlocked: ( blocked: boolean ) => void = () => {};

jest.mock(
	'../blackbox-challenge',
	() =>
		( { onSubmitBlockedChange }: { onSubmitBlockedChange: ( blocked: boolean ) => void } ) => {
			reportBlocked = onSubmitBlockedChange;
			return null;
		}
);

jest.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: jest.fn().mockResolvedValue( undefined ),
} ) );

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
		( getBlackboxSessionId as jest.Mock ).mockReset();
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( undefined );
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

	it( 'resets the session when an active form receives a failed redeem', async () => {
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: { code: 403 } } );
		await act( async () => {} );

		expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the session while protection is suspended', () => {
		const { rerender } = renderProtection( { resetOnError: null, suspended: true } );

		rerender( { resetOnError: { code: 403 }, suspended: true } );

		expect( window.Blackbox.reset ).not.toHaveBeenCalled();
	} );

	it( 'resets once while the same failure stays on the form', async () => {
		const error = { code: 403 };
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: error } );
		rerender( { resetOnError: error } );
		await act( async () => {} );

		expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'resets again after a later redeem fails', async () => {
		const { rerender } = renderProtection( { resetOnError: null } );

		rerender( { resetOnError: { code: 403 } } );
		await act( async () => {} );
		rerender( { resetOnError: null } );
		rerender( { resetOnError: { code: 429 } } );
		await act( async () => {} );

		expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 2 );
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

	it( 'enables submit when the replacement collect finishes without a challenge', async () => {
		let finishCollect: ( sessionId: string ) => void = () => {};
		( getBlackboxSessionId as jest.Mock ).mockReturnValue(
			new Promise( ( resolve ) => {
				finishCollect = resolve;
			} )
		);
		const { rerender } = render( <ContinueButton resetOnError={ null } /> );

		act( () => reportBlocked( false ) );
		rerender( <ContinueButton resetOnError={ { code: 403 } } /> );
		act( () => reportBlocked( false ) );
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeDisabled();

		await act( async () => {
			finishCollect( 'ABCDEFGHIJKLMNOPQRSTuv' );
		} );

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeEnabled();
	} );

	it( 'stays blocked when the replacement collect raises a challenge', async () => {
		let finishCollect: ( sessionId: string ) => void = () => {};
		( getBlackboxSessionId as jest.Mock ).mockReturnValue(
			new Promise( ( resolve ) => {
				finishCollect = resolve;
			} )
		);
		const { rerender } = render( <ContinueButton resetOnError={ null } /> );

		act( () => reportBlocked( false ) );
		rerender( <ContinueButton resetOnError={ { code: 403 } } /> );
		act( () => reportBlocked( true ) );

		await act( async () => {
			finishCollect( 'ABCDEFGHIJKLMNOPQRSTuv' );
		} );

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeDisabled();
	} );
} );
