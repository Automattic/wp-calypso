/**
 * @jest-environment jsdom
 */
import {
	claimGateConfirmation,
	gateResendAvailableAt,
	isFreshSignup,
	markFreshSignup,
	markGateShown,
	markResendUnavailableUntil,
} from '../storage';

const DAY = 24 * 60 * 60 * 1000;

// An attempt's record is recoverable from this tab's memory by design, so clearing storage isn't
// what separates these tests — a different attempt is.
let attempt = 0;
const nextScope = () => `onboarding:${ ++attempt }`;

describe( 'email verification gate storage', () => {
	afterEach( () => {
		jest.useRealTimers();
		localStorage.clear();
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
		// Taken — a second tab noticing the same confirmation gets nothing to record.
		expect( claimGateConfirmation( scope ) ).toBeNull();
	} );

	it( 'measures the confirmation from when the gate appeared', () => {
		jest.useFakeTimers();
		const scope = nextScope();

		markGateShown( scope );
		jest.setSystemTime( Date.now() + 90 * 1000 );

		expect( claimGateConfirmation( scope )?.secondsOnStep ).toBe( 90 );
	} );

	it( 'lets an attempt go once it is a day old with no lockout left to honour', () => {
		jest.useFakeTimers();
		const scope = nextScope();

		markGateShown( scope );
		jest.setSystemTime( Date.now() + DAY + 1000 );

		// A fresh attempt, so the next gate's view is counted rather than swallowed by the last.
		expect( markGateShown( scope ) ).toBe( true );
	} );

	it( 'keeps an attempt for as long as its lockout has left to run', () => {
		jest.useFakeTimers();
		const scope = nextScope();

		markGateShown( scope );
		markResendUnavailableUntil( scope, Date.now() + DAY + 60 * 60 * 1000 );
		jest.setSystemTime( Date.now() + DAY + 1000 );

		expect( markGateShown( scope ) ).toBe( false );
		expect( gateResendAvailableAt( scope ) ).toBeGreaterThan( Date.now() );
	} );

	it( 'stops calling a signup fresh well before the attempt itself expires', () => {
		jest.useFakeTimers();
		const scope = nextScope();

		markFreshSignup( scope );
		expect( isFreshSignup( scope ) ).toBe( true );

		jest.setSystemTime( Date.now() + 31 * 60 * 1000 );
		expect( isFreshSignup( scope ) ).toBe( false );
	} );

	// Resolving a different user than the one last stored clears browser storage wholesale. The
	// tab that owns the attempt still knows it, and must not lose a lockout or recount a view.
	it( 'puts the attempt back when local storage is cleared underneath it', () => {
		const scope = nextScope();
		markGateShown( scope );
		markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );

		localStorage.clear();

		expect( markGateShown( scope ) ).toBe( false );
		expect( gateResendAvailableAt( scope ) ).toBeGreaterThan( Date.now() );
		expect( claimGateConfirmation( scope ) ).not.toBeNull();
		// Restored, not merely remembered: another tab reading the same key finds it again.
		expect( localStorage.getItem( `onboarding-email-verification-gate:${ scope }` ) ).toBeTruthy();
	} );
} );
