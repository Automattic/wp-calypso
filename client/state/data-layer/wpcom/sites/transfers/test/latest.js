import { fetchAtomicTransfer, setAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestSite } from 'calypso/state/sites/actions';
import {
	clearPollDeadlines,
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
const start = 1000000;
let setTimeoutSpy;

const transfer = ( status, atomicTransferId = 1 ) => ( {
	atomic_transfer_id: atomicTransferId,
	blog_id: siteId,
	status,
	created_at: '2026-08-11T18:00:00Z',
} );

describe( 'requestTransfer', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( start );
		clearPollDeadlines();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

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
		const dispatch = jest.fn();
		const [ , armDeadline ] = requestTransfer( { siteId } );

		armDeadline( dispatch );
		jest.advanceTimersByTime( TRANSFER_POLL_DEADLINE_MS );

		expect( dispatch ).toHaveBeenCalledWith(
			setAtomicTransfer( siteId, { status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test( 'should anchor the deadline to the wait already in progress', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS - 1000 );
		requestTransfer( { siteId } )[ 1 ]( dispatch );
		dispatch.mockClear();
		jest.advanceTimersByTime( 1000 );

		expect( dispatch ).toHaveBeenCalledWith(
			setAtomicTransfer( siteId, { status: transferStates.CLIENT_TIMEOUT } )
		);
	} );
} );

describe( 'receiveTransfer', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		setTimeoutSpy = jest.spyOn( global, 'setTimeout' );
		jest.setSystemTime( start );
		jest.clearAllMocks();
		clearPollDeadlines();
	} );

	afterEach( () => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	} );

	test( 'should dispatch the transfer and poll while it is in progress', () => {
		const dispatch = jest.fn();
		const response = transfer( transferStates.ACTIVE );

		receiveTransfer( { siteId }, response )( dispatch );

		expect( dispatch ).toHaveBeenCalledWith( setAtomicTransfer( siteId, response ) );
		expect( setTimeoutSpy ).toHaveBeenLastCalledWith( expect.any( Function ), 10000 );
		jest.runOnlyPendingTimers();
		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test.each( [ 'reverting', 'unknown' ] )( 'should poll unknown status %s', ( status ) => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( status ) )( dispatch );
		jest.runOnlyPendingTimers();

		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should keep one poll timer per site', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );
		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );

		expect( jest.getTimerCount() ).toBe( 1 );
	} );

	test.each( [ transferStates.COMPLETED, transferStates.ERROR, transferStates.REVERTED ] )(
		'should stop polling on settled status %s',
		( status ) => {
			const dispatch = jest.fn();

			receiveTransfer( { siteId }, transfer( status ) )( dispatch );
			jest.runOnlyPendingTimers();

			expect( dispatch ).not.toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
		}
	);

	test( 'should refresh the site after completion', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.COMPLETED ) )( dispatch );

		expect( requestSite ).toHaveBeenCalledWith( siteId );
		expect( dispatch ).toHaveBeenLastCalledWith( requestSite( siteId ) );
	} );

	test( 'should keep polling until the deadline arrives', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS - 1 );
		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAtomicTransfer( siteId, transfer( transferStates.CLIENT_TIMEOUT ) )
		);
		jest.runOnlyPendingTimers();
		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should set client timeout when the deadline expires', () => {
		const dispatch = jest.fn();
		const response = transfer( transferStates.ACTIVE );

		receiveTransfer( { siteId }, response )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		receiveTransfer( { siteId }, response )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAtomicTransfer( siteId, { ...response, status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test( 'should keep timeout status sticky', () => {
		const dispatch = jest.fn();
		const response = transfer( transferStates.ACTIVE );

		receiveTransfer( { siteId }, response )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		receiveTransfer( { siteId }, response )( dispatch );
		dispatch.mockClear();
		receiveTransfer( { siteId }, response )( dispatch );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			setAtomicTransfer( siteId, { ...response, status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test.each( [ transferStates.COMPLETED, transferStates.ERROR, transferStates.REVERTED ] )(
		'should prefer settled status %s over expired deadline',
		( status ) => {
			const dispatch = jest.fn();

			receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );
			jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS + 1 );
			receiveTransfer( { siteId }, transfer( status ) )( dispatch );

			expect( dispatch ).not.toHaveBeenCalledWith(
				setAtomicTransfer( siteId, {
					...transfer( status ),
					status: transferStates.CLIENT_TIMEOUT,
				} )
			);
		}
	);

	test( 'should not reopen the deadline for the same transfer', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS + 1 );
		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAtomicTransfer( siteId, {
				...transfer( transferStates.ACTIVE ),
				status: transferStates.CLIENT_TIMEOUT,
			} )
		);
	} );

	test( 'should give a new transfer a fresh deadline', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE, 1 ) )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS + 1 );
		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE, 2 ) )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAtomicTransfer( siteId, {
				...transfer( transferStates.ACTIVE, 2 ),
				status: transferStates.CLIENT_TIMEOUT,
			} )
		);
		jest.runOnlyPendingTimers();
		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should give a new transfer a fresh deadline after the previous one timed out', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE, 1 ) )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE, 1 ) )( dispatch );

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE, 2 ) )( dispatch );
		dispatch.mockClear();
		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE, 2 ) )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAtomicTransfer( siteId, {
				...transfer( transferStates.ACTIVE, 2 ),
				status: transferStates.CLIENT_TIMEOUT,
			} )
		);
	} );

	test( 'should not let a poll from an ended wait time out a new wait', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );
		receiveTransfer( { siteId }, transfer( transferStates.COMPLETED ) )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS + 1 );
		jest.runOnlyPendingTimers();
		receiveTransfer( { siteId }, transfer( transferStates.ACTIVE ) )( dispatch );

		expect( dispatch ).not.toHaveBeenLastCalledWith(
			setAtomicTransfer( siteId, {
				...transfer( transferStates.ACTIVE ),
				status: transferStates.CLIENT_TIMEOUT,
			} )
		);
	} );

	test( 'should preserve transfer data when timing out', () => {
		const dispatch = jest.fn();
		const response = transfer( transferStates.ACTIVE );

		receiveTransfer( { siteId }, response )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		receiveTransfer( { siteId }, response )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAtomicTransfer( siteId, {
				...response,
				status: transferStates.CLIENT_TIMEOUT,
			} )
		);
	} );

	test( 'should recover from an empty response by polling', () => {
		const dispatch = jest.fn();

		receiveTransfer( { siteId }, undefined )( dispatch );
		jest.runOnlyPendingTimers();

		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );
} );

describe( 'onTransferError', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( start );
		clearPollDeadlines();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	test.each( [ { status: 404 }, { statusCode: 403 } ] )(
		'should dispatch a terminal status on client error %p',
		( error ) => {
			const dispatch = jest.fn();

			onTransferError( { siteId }, error )( dispatch );
			jest.runOnlyPendingTimers();

			expect( dispatch ).toHaveBeenCalledWith(
				setAtomicTransfer( siteId, { status: transferStates.CLIENT_TIMEOUT } )
			);
		}
	);

	test( 'should retry missing transfer records before timing out', () => {
		const dispatch = jest.fn();

		for ( let attempt = 1; attempt < 6; attempt++ ) {
			onTransferError( { siteId }, { status: 400, error: 'no_transfer_record' } )( dispatch );
			jest.runOnlyPendingTimers();
		}

		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
		onTransferError( { siteId }, { status: 400, error: 'no_transfer_record' } )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAtomicTransfer( siteId, { status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test( 'should poll again after a server error', () => {
		const dispatch = jest.fn();

		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.runOnlyPendingTimers();

		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
	} );

	test( 'should time out after server errors exceed the deadline', () => {
		const dispatch = jest.fn();

		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		onTransferError( { siteId }, { status: 500 } )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAtomicTransfer( siteId, { status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test( 'should keep timeout status sticky after server errors', () => {
		const dispatch = jest.fn();

		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		onTransferError( { siteId }, { status: 500 } )( dispatch );
		dispatch.mockClear();
		onTransferError( { siteId }, { status: 500 } )( dispatch );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			setAtomicTransfer( siteId, { status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test( 'should adopt an error-created deadline when a response succeeds', () => {
		const dispatch = jest.fn();
		const response = transfer( transferStates.ACTIVE );

		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS - 1 );
		dispatch.mockClear();
		receiveTransfer( { siteId }, response )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAtomicTransfer( siteId, { ...response, status: transferStates.CLIENT_TIMEOUT } )
		);
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		receiveTransfer( { siteId }, response )( dispatch );
		expect( dispatch ).toHaveBeenLastCalledWith(
			setAtomicTransfer( siteId, { ...response, status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test( 'should honor timeout created before a response succeeds', () => {
		const dispatch = jest.fn();
		const response = transfer( transferStates.ACTIVE );

		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		onTransferError( { siteId }, { status: 500 } )( dispatch );
		dispatch.mockClear();
		receiveTransfer( { siteId }, response )( dispatch );

		expect( dispatch ).toHaveBeenCalledWith(
			setAtomicTransfer( siteId, { ...response, status: transferStates.CLIENT_TIMEOUT } )
		);
	} );

	test( 'should start a fresh wait after a stale timeout entry', () => {
		const dispatch = jest.fn();

		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS );
		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.setSystemTime( start + TRANSFER_POLL_DEADLINE_MS * 2 + 1 );
		dispatch.mockClear();
		onTransferError( { siteId }, { status: 500 } )( dispatch );
		jest.runOnlyPendingTimers();

		expect( dispatch ).toHaveBeenCalledWith( fetchAtomicTransfer( siteId ) );
		expect( dispatch ).not.toHaveBeenCalledWith(
			setAtomicTransfer( siteId, { status: transferStates.CLIENT_TIMEOUT } )
		);
	} );
} );
