/**
 * @jest-environment jsdom
 */

import { sendVerificationSignal } from 'calypso/lib/user/verification-checker';
import emailVerification from '..';

jest.mock( 'calypso/lib/user/verification-checker', () => ( {
	sendVerificationSignal: jest.fn(),
} ) );

// Opting out keeps the result on this dashboard, which is where the notices below are shown.
const OPTED_OUT = {
	fetching: false,
	remoteValues: { 'hosting-dashboard-opt-in': { value: 'forced-opt-out' } },
};
// A cold load, before the preference that decides which dashboard has been read.
const UNRESOLVED = { fetching: false, remoteValues: null };

const contextFor = ( pathname, query, preferences = OPTED_OUT ) => ( {
	pathname,
	canonicalPath: pathname,
	query,
	page: { replace: jest.fn() },
	store: {
		getState: () => ( { preferences } ),
		dispatch: jest.fn(),
		subscribe: jest.fn( () => jest.fn() ),
	},
} );

const noticesFrom = ( context ) =>
	context.store.dispatch.mock.calls.filter( ( [ action ] ) => action?.type === 'NOTICE_CREATE' );

describe( 'emailVerification', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => jest.useRealTimers() );

	// Announcing on both this route and the one it forwards to leaves two identical notices.
	it( 'leaves an email change result to the route it is forwarded to', () => {
		const context = contextFor( '/settings/account', { new_email_result: '0' } );
		const next = jest.fn();

		emailVerification( context, next );
		jest.runAllTimers();

		expect( noticesFrom( context ) ).toHaveLength( 0 );
		expect( context.page.replace ).not.toHaveBeenCalled();
		// A second hand-off carries the chain past the redirect that forwards this result.
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'hands the route on once when the dashboard preference has not been read', () => {
		const context = contextFor( '/me/account', { new_email_result: '0' }, UNRESOLVED );
		const next = jest.fn();

		emailVerification( context, next );

		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	// Only the forwarding route is held back; anywhere else has to speak, or nothing does.
	it( 'still reports an email change result anywhere else it lands', () => {
		const context = contextFor( '/home', { new_email_result: '0' } );

		emailVerification( context, jest.fn() );
		jest.runAllTimers();

		expect( noticesFrom( context ) ).toHaveLength( 1 );
	} );

	it( 'reports a failed email change once it reaches that route', () => {
		const context = contextFor( '/me/account', { new_email_result: '0' } );

		emailVerification( context, jest.fn() );
		// Notices dispatched during the page load are cleared by it, so this one waits.
		expect( noticesFrom( context ) ).toHaveLength( 0 );

		jest.runAllTimers();

		const [ [ action ] ] = noticesFrom( context );
		expect( action.notice.status ).toBe( 'is-error' );
		expect( action.notice.text ).toMatch( /invalid or has expired/ );
		expect( context.page.replace ).toHaveBeenCalledWith( '/me/account' );
	} );

	it( 'names a taken address rather than blaming the link', () => {
		const context = contextFor( '/me/account', {
			new_email_result: '0',
			new_email_error: 'email_in_use',
		} );

		emailVerification( context, jest.fn() );
		jest.runAllTimers();

		const [ [ action ] ] = noticesFrom( context );
		expect( action.notice.text ).toMatch( /already used by another WordPress\.com account/ );
	} );

	// The reason is optional, so an unrecognised one has to read as before rather than as nothing.
	it( 'falls back to the generic message for a reason it does not know', () => {
		const context = contextFor( '/me/account', {
			new_email_result: '0',
			new_email_error: 'something_new',
		} );

		emailVerification( context, jest.fn() );
		jest.runAllTimers();

		const [ [ action ] ] = noticesFrom( context );
		expect( action.notice.text ).toMatch( /invalid or has expired/ );
	} );

	it( 'confirms an email change that worked', () => {
		const context = contextFor( '/me/account', { new_email_result: '1' } );

		emailVerification( context, jest.fn() );
		jest.runAllTimers();

		const [ [ action ] ] = noticesFrom( context );
		expect( action.notice.status ).toBe( 'is-success' );
		expect( action.notice.text ).toMatch( /Email address updated/ );
		expect( context.page.replace ).toHaveBeenCalledWith( '/me/account' );
	} );

	// A failed verification link is otherwise silent, the same dead end as a failed change.
	it( 'reports a verification link that did not work', () => {
		const context = contextFor( '/me/account', { verified: '0' } );

		emailVerification( context, jest.fn() );
		jest.runAllTimers();

		const [ [ action ] ] = noticesFrom( context );
		expect( action.notice.status ).toBe( 'is-error' );
		expect( action.notice.text ).toMatch( /invalid or has expired/ );
		expect( context.page.replace ).toHaveBeenCalledWith( '/me/account' );
	} );

	// Storage throws when it is disabled or full, and this only tells other tabs.
	it( 'still confirms a verified email when other tabs cannot be told', () => {
		sendVerificationSignal.mockImplementationOnce( () => {
			throw new Error( 'storage disabled' );
		} );
		const context = contextFor( '/me/account', { verified: '1' } );

		expect( () => emailVerification( context, jest.fn() ) ).not.toThrow();
		jest.runAllTimers();

		expect( noticesFrom( context ) ).toHaveLength( 1 );
	} );

	// Verification arrives on its own argument, which that path does not forward.
	it( 'still reports a verified email on the route it lands on', () => {
		const context = contextFor( '/settings/account', { verified: '1' } );

		emailVerification( context, jest.fn() );
		jest.runAllTimers();

		expect( noticesFrom( context ) ).toHaveLength( 1 );
	} );
} );
