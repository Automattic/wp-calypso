import { fetchAtomicTransfer, setAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestSite } from 'calypso/state/sites/actions';
import {
	clearTransferWaits,
	onTransferError,
	receiveTransfer,
	requestTransfer,
	TRANSFER_POLL_DEADLINE_MS,
} from '../latest';

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn( ( requestedSiteId ) => ( {
		type: 'TEST_REQUEST_SITE',
		siteId: requestedSiteId,
	} ) ),
} ) );

const siteId = 1916284;
const POLL_INTERVAL_MS = 10000;

const transfer = ( status, atomicTransferId = 1 ) => ( {
	atomic_transfer_id: atomicTransferId,
	blog_id: siteId,
	status,
	created_at: '2026-08-11T18:00:00Z',
} );

const timedOut = ( transferData = {} ) =>
	setAtomicTransfer( siteId, { ...transferData, status: transferStates.CLIENT_TIMEOUT } );

// The handlers read the transfer back out of the store, so the fake one applies what they dispatch
// the same way the reducer does.
const createStore = () => {
	const state = { atomicTransfer: {} };
	const getState = () => state;
	const dispatch = jest.fn( ( action ) => {
		if ( action?.type === setAtomicTransfer( siteId, {} ).type ) {
			state.atomicTransfer[ action.siteId ] = {
				...state.atomicTransfer[ action.siteId ],
				...action.transfer,
			};
		}

		return action;
	} );

	return { dispatch, getState };
};

// Every response follows a request, so tests arm the deadline the way production arms it.
const startWait = ( { dispatch, getState } ) =>
	requestTransfer( { siteId } )[ 1 ]( dispatch, getState );

const receive = ( store, transferData ) =>
	receiveTransfer( { siteId }, transferData )( store.dispatch, store.getState );

const fail = ( store, error ) =>
	onTransferError( { siteId }, error )( store.dispatch, store.getState );

beforeEach( () => {
	jest.useFakeTimers();
	jest.clearAllMocks();
	clearTransferWaits();
} );

afterEach( () => {
	jest.useRealTimers();
} );

describe( 'requestTransfer', () => {
	test( 'should dispatch an http request', () => {
		const [ request ] = requestTransfer( { siteId } );

		expect( request ).toEqual(
			http(
				{
					method: 'GET',
					path: `/sites/${ siteId }/transfers/latest`,
					apiVersion: '1.2',
				},
				{ siteId }
			)
		);
	} );

	test( 'should time out a request that never responds', () => {
		const store = createStore();

		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );

		expect( store.dispatch ).toHaveBeenCalledWith( timedOut() );
	} );

	test( 'should not extend the deadline of a wait already in progress', () => {
		const store = createStore();

		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS / 2 );
		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS / 2 );

		expect( store.dispatch ).toHaveBeenCalledWith( timedOut() );
	} );

	test( 'should not start a new deadline once the wait has timed out', () => {
		const store = createStore();

		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );
		store.dispatch.mockClear();
		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );

		expect( store.dispatch ).not.toHaveBeenCalled();
	} );
} );

describe( 'receiveTransfer', () => {
	test( 'should dispatch the transfer and poll while it is in progress', () => {
		const store = createStore();
		const response = transfer( transferStates.ACTIVE );

		receive( store, response );

		expect( store.dispatch ).toHaveBeenCalledWith( setAtomicTransfer( siteId, response ) );
		jest.advanceTimersByTime( POLL_INTERVAL_MS );
		expect( store.dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test.each( [ 'reverting', 'unknown' ] )( 'should poll unknown status %s', ( status ) => {
		const store = createStore();

		receive( store, transfer( status ) );
		jest.advanceTimersByTime( POLL_INTERVAL_MS );

		expect( store.dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should keep one poll timer per site', () => {
		const store = createStore();

		receive( store, transfer( transferStates.ACTIVE ) );
		receive( store, transfer( transferStates.ACTIVE ) );

		expect( jest.getTimerCount() ).toBe( 1 );
	} );

	test.each( [ transferStates.COMPLETED, transferStates.ERROR, transferStates.REVERTED ] )(
		'should stop polling on settled status %s',
		( status ) => {
			const store = createStore();

			receive( store, transfer( status ) );
			jest.advanceTimersByTime( POLL_INTERVAL_MS );

			expect( store.dispatch ).not.toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
		}
	);

	test( 'should refresh the site after completion', () => {
		const store = createStore();

		receive( store, transfer( transferStates.COMPLETED ) );

		expect( requestSite ).toHaveBeenCalledWith( siteId );
		expect( store.dispatch ).toHaveBeenLastCalledWith( requestSite( siteId ) );
	} );

	test( 'should keep polling until the deadline arrives', () => {
		const store = createStore();
		const response = transfer( transferStates.ACTIVE );

		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS / 2 );
		receive( store, response );

		expect( store.dispatch ).not.toHaveBeenCalledWith( timedOut( response ) );
		jest.advanceTimersByTime( POLL_INTERVAL_MS );
		expect( store.dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should stop polling once the deadline expires', () => {
		const store = createStore();

		startWait( store );
		receive( store, transfer( transferStates.ACTIVE ) );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );
		store.dispatch.mockClear();
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );

		expect( store.dispatch ).not.toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should keep reporting the timeout to late responses, with their data', () => {
		const store = createStore();
		const response = transfer( transferStates.ACTIVE );

		startWait( store );
		receive( store, response );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );
		store.dispatch.mockClear();
		receive( store, response );

		expect( store.dispatch ).toHaveBeenCalledTimes( 1 );
		expect( store.dispatch ).toHaveBeenCalledWith( timedOut( response ) );
	} );

	test( 'should give a new transfer a fresh wait after the previous one timed out', () => {
		const store = createStore();
		const newTransfer = transfer( transferStates.ACTIVE, 2 );

		startWait( store );
		receive( store, transfer( transferStates.ACTIVE, 1 ) );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );
		store.dispatch.mockClear();

		receive( store, newTransfer );
		receive( store, newTransfer );

		expect( store.dispatch ).not.toHaveBeenCalledWith( timedOut( newTransfer ) );
		expect( store.dispatch ).toHaveBeenCalledWith( setAtomicTransfer( siteId, newTransfer ) );
		jest.advanceTimersByTime( POLL_INTERVAL_MS );
		expect( store.dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should recover from an empty response by polling', () => {
		const store = createStore();

		receive( store, undefined );
		jest.advanceTimersByTime( POLL_INTERVAL_MS );

		expect( store.dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should report the timeout for an empty response after the deadline', () => {
		const store = createStore();

		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );
		store.dispatch.mockClear();
		receive( store, undefined );

		expect( store.dispatch ).toHaveBeenCalledWith( timedOut() );
	} );
} );

describe( 'onTransferError', () => {
	test.each( [ { status: 404 }, { statusCode: 403 } ] )(
		'should end the wait on client error %p',
		( error ) => {
			const store = createStore();

			startWait( store );
			fail( store, error );
			jest.advanceTimersByTime( POLL_INTERVAL_MS );

			expect( store.dispatch ).toHaveBeenCalledWith( timedOut() );
			expect( store.dispatch ).not.toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
		}
	);

	test( 'should retry missing transfer records before ending the wait', () => {
		const store = createStore();
		const missingRecord = { status: 400, error: 'no_transfer_record' };

		startWait( store );

		for ( let attempt = 1; attempt < 6; attempt++ ) {
			fail( store, missingRecord );
			jest.advanceTimersByTime( POLL_INTERVAL_MS );
		}

		expect( store.dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
		store.dispatch.mockClear();
		fail( store, missingRecord );

		expect( store.dispatch ).toHaveBeenCalledWith( timedOut() );
	} );

	test( 'should poll again after a server error', () => {
		const store = createStore();

		startWait( store );
		fail( store, { status: 500 } );
		jest.advanceTimersByTime( POLL_INTERVAL_MS );

		expect( store.dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should stop retrying server errors once the wait has timed out', () => {
		const store = createStore();

		startWait( store );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );
		store.dispatch.mockClear();
		fail( store, { status: 500 } );
		jest.advanceTimersByTime( POLL_INTERVAL_MS );

		expect( store.dispatch ).toHaveBeenCalledWith( timedOut() );
		expect( store.dispatch ).not.toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );
} );
