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

const denyWrites = () =>
	jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
		throw new Error( 'denied' );
	} );

describe( 'email verification gate storage', () => {
	afterEach( () => {
		jest.useRealTimers();
		localStorage.clear();
		jest.resetModules();
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

	// Storage can refuse a write outright, and can be cleared out from under an attempt that is
	// still running. Neither should cost this tab the confirmation it is able to record, nor let a
	// remount count the view twice.
	it( 'holds the attempt together for the tab when nothing can be written', () => {
		const scope = nextScope();
		const denied = denyWrites();

		expect( markGateShown( scope ) ).toBe( true );
		expect( markGateShown( scope ) ).toBe( false );

		markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );
		expect( gateResendAvailableAt( scope ) ).toBeGreaterThan( Date.now() );
		expect( claimGateConfirmation( scope ) ).not.toBeNull();
		expect( claimGateConfirmation( scope ) ).toBeNull();

		denied.mockRestore();
	} );

	// The lockout is the one thing rewritten during an attempt, so it is the one that can be half
	// written down — persisted, then extended by a write that storage refuses.
	it( 'keeps an extension it could not write over the deadline it could', () => {
		const scope = nextScope();
		const long = Date.now() + 4 * 60 * 60 * 1000;

		markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );
		const denied = denyWrites();
		markResendUnavailableUntil( scope, long );

		expect( gateResendAvailableAt( scope ) ).toBe( long );

		denied.mockRestore();
	} );

	// Reading it back through a fresh module is the whole point: the copy this tab kept in memory
	// would answer either way, and what a reload or another tab gets is only what was written.
	it( 'hands a lockout and a claimed attempt to a tab that has neither in memory', async () => {
		const scope = nextScope();
		const deadline = Date.now() + 5 * 60 * 1000;

		markResendUnavailableUntil( scope, deadline );
		markGateShown( scope );
		claimGateConfirmation( scope );

		jest.resetModules();
		const reloaded = await import( '../storage' );

		expect( reloaded.gateResendAvailableAt( scope ) ).toBe( deadline );
		expect( reloaded.markGateShown( scope ) ).toBe( false );
		expect( reloaded.claimGateConfirmation( scope ) ).toBeNull();
	} );

	// Local rather than session storage because session storage is copied into a duplicated tab and
	// restored with a reopened one. Each would inherit the view and claim the confirmation again.
	it( 'lets only one of two tabs sharing an attempt record it', async () => {
		const scope = nextScope();

		expect( markGateShown( scope ) ).toBe( true );

		jest.resetModules();
		const otherTab = await import( '../storage' );

		expect( otherTab.markGateShown( scope ) ).toBe( false );
		expect( claimGateConfirmation( scope ) ).not.toBeNull();
		expect( otherTab.claimGateConfirmation( scope ) ).toBeNull();
	} );

	// So an abandoned attempt doesn't suppress the view of the next one, or report the days between
	// them as time spent on the step.
	it( 'stops speaking for a later attempt once it is a day old', () => {
		jest.useFakeTimers();
		const scope = nextScope();

		markGateShown( scope );
		jest.setSystemTime( Date.now() + 25 * 60 * 60 * 1000 );

		expect( markGateShown( scope ) ).toBe( true );
		expect( claimGateConfirmation( scope )?.secondsOnStep ).toBe( 0 );
	} );
} );
