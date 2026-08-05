/**
 * @jest-environment jsdom
 */
import {
	claimGateConfirmation,
	gateResendAvailableAt,
	markGateShown,
	markResendUnavailableUntil,
} from '../storage';

const DAY = 24 * 60 * 60 * 1000;

// A scope per test, so each one's isolation is its own rather than teardown's.
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
		expect( claimGateConfirmation( scope ) ).toEqual( {
			secondsOnStep: expect.any( Number ),
		} );
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

	// The countdown a tab is showing has to agree with what the server will enforce, so a stale
	// deadline arriving after a longer one mustn't win.
	it( 'never shortens a lockout that is already running', () => {
		const scope = nextScope();
		markGateShown( scope );

		const long = Date.now() + 4 * 60 * 60 * 1000;
		markResendUnavailableUntil( scope, long );
		markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );

		expect( gateResendAvailableAt( scope ) ).toBe( long );
	} );

	// The harder half of the same case: a full quota rejects writes while reads keep answering, so
	// storage confidently returns a record that is behind what this tab knows.
	it( 'reads what it remembers when its writes are the part that fail', () => {
		const scope = nextScope();
		const setItem = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'quota' );
		} );

		expect( markGateShown( scope ) ).toBe( true );
		markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );

		// Reads still work, and would report an attempt that never happened.
		expect( localStorage.getItem( `onboarding-email-verification-gate:${ scope }` ) ).toBeNull();

		expect( markGateShown( scope ) ).toBe( false );
		expect( gateResendAvailableAt( scope ) ).toBeGreaterThan( Date.now() );
		expect( claimGateConfirmation( scope ) ).not.toBeNull();

		setItem.mockRestore();
	} );

	// Falling back is for as long as it's needed and no longer: a tab that stopped reading shared
	// storage would stop seeing every other tab, for an attempt that persists again perfectly well.
	it( 'goes back to shared storage once a write lands again', () => {
		const scope = nextScope();
		const key = `onboarding-email-verification-gate:${ scope }`;
		const setItem = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementationOnce( () => {
			throw new Error( 'quota' );
		} );

		markGateShown( scope );
		markResendUnavailableUntil( scope, Date.now() + 60 * 1000 );
		setItem.mockRestore();

		// What another tab writing to the same attempt leaves behind.
		const later = Date.now() + 10 * 60 * 1000;
		localStorage.setItem(
			key,
			JSON.stringify( {
				...JSON.parse( localStorage.getItem( key ) as string ),
				resendAvailableAt: later,
			} )
		);

		expect( gateResendAvailableAt( scope ) ).toBe( later );
	} );

	// The one thing the in-memory copy is for. Nothing is shared between tabs in this state, but a
	// tab's own attempt still has to hold together.
	it( 'falls back to what it remembers when storage is unavailable', () => {
		const scope = nextScope();
		markGateShown( scope );
		markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );

		const getItem = jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'unavailable' );
		} );

		expect( markGateShown( scope ) ).toBe( false );
		expect( gateResendAvailableAt( scope ) ).toBeGreaterThan( Date.now() );
		expect( claimGateConfirmation( scope ) ).not.toBeNull();

		getItem.mockRestore();
	} );
} );
