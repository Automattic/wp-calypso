/**
 * @jest-environment jsdom
 */
import {
	claimGateConfirmation,
	gateResendAvailableAt,
	markGateShown,
	markResendUnavailableUntil,
} from '../storage';

// A scope per test, so each one's isolation is its own rather than teardown's.
let attempt = 0;
const nextScope = () => `onboarding:${ ++attempt }`;

describe( 'email verification gate storage', () => {
	afterEach( () => {
		jest.useRealTimers();
		sessionStorage.clear();
	} );

	it( 'stamps the gate as shown for the first caller only', () => {
		const scope = nextScope();

		expect( markGateShown( scope ) ).toBe( true );
		expect( markGateShown( scope ) ).toBe( false );
	} );

	it( 'has no confirmation to claim until a gate has been shown', () => {
		const scope = nextScope();

		expect( claimGateConfirmation( scope ) ).toBeNull();

		markGateShown( scope );
		expect( claimGateConfirmation( scope ) ).toEqual( { secondsOnStep: expect.any( Number ) } );
		// Already recorded — a remount mustn't count it again.
		expect( claimGateConfirmation( scope ) ).toBeNull();
	} );

	it( 'measures the confirmation from when the gate appeared', () => {
		jest.useFakeTimers();
		const scope = nextScope();

		markGateShown( scope );
		jest.setSystemTime( Date.now() + 90 * 1000 );

		expect( claimGateConfirmation( scope )?.secondsOnStep ).toBe( 90 );
	} );

	// The countdown a tab shows has to agree with what the server will enforce, so a smaller wait
	// arriving later mustn't replace one that is still running.
	it( 'never shortens a lockout that is already running', () => {
		const scope = nextScope();
		const long = Date.now() + 4 * 60 * 60 * 1000;

		markResendUnavailableUntil( scope, long );
		markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );

		expect( gateResendAvailableAt( scope ) ).toBe( long );
	} );

	it( 'keeps a lockout where a reload can find it', () => {
		const scope = nextScope();
		const deadline = Date.now() + 5 * 60 * 1000;

		markResendUnavailableUntil( scope, deadline );

		// What the next mount reads, rather than anything this one is holding in memory.
		const stored = sessionStorage.getItem( `onboarding-email-verification-gate:${ scope }` );
		expect( JSON.parse( stored as string ) ).toEqual(
			expect.objectContaining( { resendAvailableAt: deadline } )
		);
	} );
} );
