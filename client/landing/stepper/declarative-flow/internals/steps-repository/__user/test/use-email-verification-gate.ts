/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import { useEmailVerificationGate } from '../use-email-verification-gate';

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const enabledFlags = new Set< string >();
	const configFn = ( key: string ) => actual( key );
	Object.assign( configFn, actual, {
		enabledFlags,
		isEnabled: ( flag: string ) => enabledFlags.has( flag ) || actual.isEnabled( flag ),
	} );
	return configFn;
} );

jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );

const mockConfig = config as unknown as { enabledFlags: Set< string > };
const mockUser = ( user: object | null ) =>
	( useSelector as unknown as jest.Mock ).mockReturnValue( user );

const statusFor = ( flow = 'onboarding' ) =>
	renderHook( () => useEmailVerificationGate( flow ) ).result.current.status;

describe( 'useEmailVerificationGate', () => {
	beforeEach( () => {
		mockConfig.enabledFlags.add( 'onboarding/email-verification' );
	} );
	afterEach( () => {
		mockConfig.enabledFlags.clear();
		jest.clearAllMocks();
	} );

	it( 'gates an unverified email account', () => {
		mockUser( { email_verified: false } );

		expect( statusFor() ).toBe( 'gated' );
	} );

	// Which is the whole of what keeps social signups out: they are created already verified.
	it( 'clears a verified account', () => {
		mockUser( { email_verified: true } );

		expect( statusFor() ).toBe( 'verified' );
	} );

	// Its address was generated for it, so there is no link in an inbox for the gate to point at.
	it( 'clears an unverified phone account', () => {
		mockUser( { email_verified: false, phone_account: true } );

		expect( statusFor() ).toBe( 'clear' );
	} );

	// The user's ID survives a reload but the user object does not, so being logged in is not the
	// same as knowing anything. Reading the absent fields as unverified opens the gate on nobody.
	it( 'waits rather than guessing while the user object is missing', () => {
		mockUser( null );

		expect( statusFor() ).toBe( 'pending' );
	} );

	it( 'clears every flow but onboarding', () => {
		mockUser( { email_verified: false } );

		expect( statusFor( 'newsletter' ) ).toBe( 'clear' );
	} );

	describe( 'with the flag off', () => {
		beforeEach( () => mockConfig.enabledFlags.clear() );

		it( 'clears an unverified account rather than gating it', () => {
			mockUser( { email_verified: false } );

			expect( statusFor() ).toBe( 'clear' );
		} );

		// Not `clear`: turning the flag off is not the user having confirmed, and treating it as
		// one would record a confirmation and spend the attempt that a real one needed.
		it( 'still reports a verified account as verified', () => {
			mockUser( { email_verified: true } );

			expect( statusFor() ).toBe( 'verified' );
		} );
	} );
} );
