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

	it( 'stamps the gate as shown for the first caller only', async () => {
		const scope = nextScope();

		expect( await markGateShown( scope ) ).toBe( true );
		expect( await markGateShown( scope ) ).toBe( false );
	} );

	it( 'has no confirmation to claim until a gate has been shown', async () => {
		const scope = nextScope();

		expect( await claimGateConfirmation( scope ) ).toBeNull();

		await markGateShown( scope );
		expect( await claimGateConfirmation( scope ) ).toEqual( {
			secondsOnStep: expect.any( Number ),
		} );
		// Taken — a second tab noticing the same confirmation gets nothing to record.
		expect( await claimGateConfirmation( scope ) ).toBeNull();
	} );

	it( 'measures the confirmation from when the gate appeared', async () => {
		jest.useFakeTimers();
		const scope = nextScope();

		await markGateShown( scope );
		jest.setSystemTime( Date.now() + 90 * 1000 );

		expect( ( await claimGateConfirmation( scope ) )?.secondsOnStep ).toBe( 90 );
	} );

	it( 'lets an attempt go once it is a day old with no lockout left to honour', async () => {
		jest.useFakeTimers();
		const scope = nextScope();

		await markGateShown( scope );
		jest.setSystemTime( Date.now() + DAY + 1000 );

		// A fresh attempt, so the next gate's view is counted rather than swallowed by the last.
		expect( await markGateShown( scope ) ).toBe( true );
	} );

	it( 'keeps an attempt for as long as its lockout has left to run', async () => {
		jest.useFakeTimers();
		const scope = nextScope();

		await markGateShown( scope );
		await markResendUnavailableUntil( scope, Date.now() + DAY + 60 * 60 * 1000 );
		jest.setSystemTime( Date.now() + DAY + 1000 );

		expect( await markGateShown( scope ) ).toBe( false );
		expect( gateResendAvailableAt( scope ) ).toBeGreaterThan( Date.now() );
	} );

	it( 'stops calling a signup fresh well before the attempt itself expires', async () => {
		jest.useFakeTimers();
		const scope = nextScope();

		await markFreshSignup( scope );
		expect( isFreshSignup( scope ) ).toBe( true );

		jest.setSystemTime( Date.now() + 31 * 60 * 1000 );
		expect( isFreshSignup( scope ) ).toBe( false );
	} );

	// jsdom has no Web Locks, so every other test here exercises the unguarded fallback. This one
	// checks the guarded path is the one taken where the browser offers it.
	it( 'serializes a transition through a cross-document lock when there is one', async () => {
		const request = jest.fn( ( _name: string, fn: () => unknown ) => Promise.resolve( fn() ) );
		Object.defineProperty( navigator, 'locks', { value: { request }, configurable: true } );
		const scope = nextScope();

		expect( await markGateShown( scope ) ).toBe( true );
		expect( request ).toHaveBeenCalledWith(
			`onboarding-email-verification-gate:${ scope }`,
			expect.any( Function )
		);

		// Held for the whole read-check-write, so a second tab can't see it untouched.
		expect( await markGateShown( scope ) ).toBe( false );

		Object.defineProperty( navigator, 'locks', { value: undefined, configurable: true } );
	} );

	// Only the tab that wrote an attempt used to remember it, so a tab that merely read one — or
	// wrote to it before another tab did — had nothing, or the wrong thing, to put back.
	it( 'restores what another tab last wrote, not what this one last wrote', async () => {
		const scope = nextScope();
		const key = `onboarding-email-verification-gate:${ scope }`;
		await markGateShown( scope );

		// What another tab writing to the same attempt leaves behind.
		const deadline = Date.now() + 5 * 60 * 1000;
		const fromOtherTab = {
			...JSON.parse( localStorage.getItem( key ) as string ),
			resendAvailableAt: deadline,
		};
		localStorage.setItem( key, JSON.stringify( fromOtherTab ) );

		// Reading it is all this tab does — no write of its own to remember it by.
		expect( gateResendAvailableAt( scope ) ).toBe( deadline );

		localStorage.clear();

		expect( gateResendAvailableAt( scope ) ).toBe( deadline );
		expect( await markGateShown( scope ) ).toBe( false );
	} );

	// Resolving a different user than the one last stored clears browser storage wholesale. The
	// tab that owns the attempt still knows it, and must not lose a lockout or recount a view.
	it( 'puts the attempt back when local storage is cleared underneath it', async () => {
		const scope = nextScope();
		await markGateShown( scope );
		await markResendUnavailableUntil( scope, Date.now() + 5 * 60 * 1000 );

		localStorage.clear();

		expect( await markGateShown( scope ) ).toBe( false );
		expect( gateResendAvailableAt( scope ) ).toBeGreaterThan( Date.now() );
		expect( await claimGateConfirmation( scope ) ).not.toBeNull();
		// Restored, not merely remembered: another tab reading the same key finds it again.
		expect( localStorage.getItem( `onboarding-email-verification-gate:${ scope }` ) ).toBeTruthy();
	} );
} );
