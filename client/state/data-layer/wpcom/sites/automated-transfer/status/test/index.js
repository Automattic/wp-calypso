import { SITE_REQUEST } from 'calypso/state/action-types';
import {
	automatedTransferStatusFetchingFailure,
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/actions';
import {
	NO_TRANSFER_RECORD_ERROR,
	transferStates,
} from 'calypso/state/automated-transfer/constants';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	requestStatus,
	receiveStatus,
	requestingStatusFailure,
	clearPollDeadlines,
	MISSING_RECORD_ATTEMPTS,
	TRANSFER_STATUS_POLL_DEADLINE_MS,
} from '../';

const siteId = 1916284;

const COMPLETE_RESPONSE = {
	blog_id: 1916284,
	status: 'complete',
	uploaded_plugin_slug: 'hello-dolly',
	transfer_id: 1,
};

const IN_PROGRESS_RESPONSE = {
	blog_id: 1916284,
	status: 'uploading',
	uploaded_plugin_slug: 'hello-dolly',
	transfer_id: 1,
};

const settledResponse = ( status ) => ( {
	blog_id: 1916284,
	status,
	uploaded_plugin_slug: 'hello-dolly',
	transfer_id: 1,
} );

describe( 'requestStatus', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		clearPollDeadlines();
	} );
	afterEach( () => jest.useRealTimers() );

	test( 'should dispatch an http request', () => {
		expect( requestStatus( { siteId } ) ).toEqual(
			http(
				{
					method: 'GET',
					path: `/sites/${ siteId }/automated-transfers/status`,
					apiVersion: '1',
				},
				{ siteId }
			)
		);
	} );

	test( 'should restart the polling deadline when requested', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		requestStatus( { siteId, pollingMode: 'start' } );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );

		requestStatus( { siteId, pollingMode: 'start' } );
		const dispatch = jest.fn();
		requestingStatusFailure( { siteId, pollingMode: 'start' } )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT )
		);
	} );
} );

describe( 'requestingStatusFailure', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		clearPollDeadlines();
	} );
	afterEach( () => jest.useRealTimers() );

	test( 'should retry failed requests at the polling cadence when the wait opted in', () => {
		const response = {
			siteId,
			pollingMode: 'start',
			meta: { dataLayer: { error: { message: 'Service unavailable' } } },
		};
		requestStatus( { siteId, pollingMode: 'start' } );
		const dispatch = jest.fn();

		requestingStatusFailure( response )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledWith(
			automatedTransferStatusFetchingFailure( {
				siteId,
				error: 'Service unavailable',
			} )
		);
		expect( dispatch ).toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId, 'continue' ) );
	} );

	test( 'should not retry or time out a failure when the wait did not opt in', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		requestStatus( { siteId } );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );
		const dispatch = jest.fn();

		requestingStatusFailure( {
			siteId,
			meta: { dataLayer: { error: { message: 'Service unavailable' } } },
		} )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledWith(
			automatedTransferStatusFetchingFailure( { siteId, error: 'Service unavailable' } )
		);
		expect( dispatch ).not.toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT )
		);
	} );

	test( 'should time out repeated request failures against the original request', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		requestStatus( { siteId, pollingMode: 'start' } );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );
		const dispatch = jest.fn();

		requestingStatusFailure( { siteId, pollingMode: 'start' } )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT )
		);
	} );

	test( 'should stop retrying a missing transfer record after a few attempts', () => {
		const response = {
			siteId,
			pollingMode: 'start',
			meta: { dataLayer: { error: { message: NO_TRANSFER_RECORD_ERROR } } },
		};
		requestStatus( { siteId, pollingMode: 'start' } );
		const dispatch = jest.fn();

		for ( let attempt = 0; attempt < MISSING_RECORD_ATTEMPTS; attempt++ ) {
			requestingStatusFailure( response )( dispatch );
			jest.runAllTimers();
		}

		const retries = dispatch.mock.calls.filter(
			( [ action ] ) => action?.type === fetchAutomatedTransferStatus( siteId ).type
		);
		expect( retries ).toHaveLength( MISSING_RECORD_ATTEMPTS - 1 );
		retries.forEach( ( [ action ] ) => expect( action.pollingMode ).toBe( 'continue' ) );
		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT )
		);
	} );

	test( 'should not turn a missing transfer record into a client timeout at the deadline', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		requestStatus( { siteId, pollingMode: 'start' } );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );
		const dispatch = jest.fn();

		requestingStatusFailure( {
			siteId,
			pollingMode: 'start',
			meta: { dataLayer: { error: { message: NO_TRANSFER_RECORD_ERROR } } },
		} )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT )
		);
	} );

	test( 'should not leave deadline state behind after a fail-once request', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		requestStatus( { siteId } );
		const dispatch = jest.fn();
		requestingStatusFailure( {
			siteId,
			meta: { dataLayer: { error: { message: 'Service unavailable' } } },
		} )( dispatch );

		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS + 60000 );
		requestStatus( { siteId, pollingMode: 'start' } );
		const waitDispatch = jest.fn();
		receiveStatus( { siteId, pollingMode: 'start' }, IN_PROGRESS_RESPONSE )( waitDispatch );

		expect( waitDispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
		expect( waitDispatch ).toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, 'uploading', 'hello-dolly' )
		);
	} );

	test( 'should not let a concurrent wait opt other dispatchers into retries', () => {
		requestStatus( { siteId, pollingMode: 'start' } );
		const dispatch = jest.fn();

		requestingStatusFailure( {
			siteId,
			meta: { dataLayer: { error: { message: 'Service unavailable' } } },
		} )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).not.toHaveBeenCalledWith(
			expect.objectContaining( { type: fetchAutomatedTransferStatus( siteId ).type } )
		);
	} );

	test( 'should not let a stale failure resurrect a wait that has settled', () => {
		requestStatus( { siteId, pollingMode: 'start' } );
		const dispatch = jest.fn();
		receiveStatus( { siteId, pollingMode: 'continue' }, settledResponse( 'complete' ) )( dispatch );

		const staleDispatch = jest.fn();
		requestingStatusFailure( {
			siteId,
			pollingMode: 'start',
			meta: { dataLayer: { error: { message: 'Service unavailable' } } },
		} )( staleDispatch );
		jest.runAllTimers();

		expect( staleDispatch ).not.toHaveBeenCalledWith(
			expect.objectContaining( { type: fetchAutomatedTransferStatus( siteId ).type } )
		);
		expect( staleDispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT )
		);
	} );

	test( 'should not retry a failed single recovery check', () => {
		requestStatus( { siteId, pollingMode: 'single' } );
		const dispatch = jest.fn();

		requestingStatusFailure( { siteId, pollingMode: 'single' } )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).not.toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );
} );

describe( 'receiveStatus', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		clearPollDeadlines();
	} );
	afterEach( () => {
		jest.useRealTimers();
	} );

	test( 'should dispatch set status action', () => {
		const dispatch = jest.fn();
		receiveStatus( { siteId }, COMPLETE_RESPONSE )( dispatch );
		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, 'complete', 'hello-dolly' )
		);
	} );

	test( 'should refetch the site if complete', () => {
		const dispatch = jest.fn( ( thunkDispatch ) => {
			if ( thunkDispatch instanceof Function ) {
				thunkDispatch( dispatch );
			}
		} );
		receiveStatus( { siteId }, COMPLETE_RESPONSE )( dispatch );
		expect( dispatch ).toHaveBeenCalledTimes( 3 );
		expect( dispatch ).toHaveBeenLastCalledWith( { type: SITE_REQUEST, siteId } );
	} );

	test( 'should request status again if not complete', () => {
		const dispatch = jest.fn();
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );

	test( 'should not open a polling chain for a single recovery check', () => {
		const dispatch = jest.fn();
		receiveStatus( { siteId, pollingMode: 'single' }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).not.toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );

	test( 'should not let a single recovery check clobber a running chain deadline', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		requestStatus( { siteId } );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS - 1000 );
		receiveStatus( { siteId, pollingMode: 'single' }, IN_PROGRESS_RESPONSE )( dispatch );

		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );

	test( 'should keep the wait polling mode when the transfer record changes mid-wait', () => {
		const dispatch = jest.fn();

		receiveStatus( { siteId, pollingMode: 'start' }, IN_PROGRESS_RESPONSE )( dispatch );
		receiveStatus(
			{ siteId, pollingMode: 'continue' },
			{ ...IN_PROGRESS_RESPONSE, transfer_id: 2 }
		)( dispatch );
		jest.runAllTimers();

		const scheduled = dispatch.mock.calls.filter(
			( [ action ] ) => action?.type === fetchAutomatedTransferStatus( siteId ).type
		);
		expect( scheduled.length ).toBeGreaterThan( 0 );
		scheduled.forEach( ( [ action ] ) => expect( action.pollingMode ).toBe( 'continue' ) );
	} );

	test( 'should keep polling until the deadline arrives', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS - 1 );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );

	test( 'should set client timeout when the deadline expires', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );

	test( 'should stay timed out rather than reopening the window', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		// Screens keep fetching after the error appears; none of those may revive the wait.
		dispatch.mockClear();
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );

	test( 'should let the transfer finishing clear a timed-out wait', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		dispatch.mockClear();
		receiveStatus( { siteId }, COMPLETE_RESPONSE )( dispatch );

		expect( dispatch ).toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.COMPLETE, 'hello-dolly' )
		);
	} );

	test( 'should not apply a deadline left behind by a previous transfer', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		// A wait whose polling died at the HTTP layer leaves its deadline behind.
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		// Much later, a genuinely new transfer starts. It must get its own five minutes.
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS + 1 );
		receiveStatus( { siteId }, { ...IN_PROGRESS_RESPONSE, transfer_id: 2 } )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
		expect( dispatch ).toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );

	test( 'should not let a poll scheduled by an ended wait time out the next one', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		// A wait runs long, then ends.
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS - 1 );
		receiveStatus( { siteId }, COMPLETE_RESPONSE )( dispatch );

		// A poll it had already scheduled lands afterwards, during a new wait.
		jest.runAllTimers();
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );

	test.each( [
		transferStates.COMPLETE,
		transferStates.COMPLETED,
		transferStates.ERROR,
		transferStates.FAILURE,
		transferStates.CONFLICTS,
		transferStates.REVERTED,
	] )( 'should prefer the settled status %s over an expired deadline', ( status ) => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS + 1 );
		receiveStatus( { siteId }, settledResponse( status ) )( dispatch );

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );

	test.each( [
		transferStates.COMPLETED,
		transferStates.FAILURE,
		transferStates.CONFLICTS,
		transferStates.REVERTED,
	] )( 'should stop polling on the settled status %s', ( status ) => {
		jest.setSystemTime( 1000000 );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, settledResponse( status ) )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).not.toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );

	test( 'should bound a wait across requests that each look like a fresh start', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		// Consumers re-dispatch on every status change. Each of those must join the wait already
		// in progress rather than opening a fresh window, or the wait is never bounded.
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS + 1 );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );

	test( 'should give a later wait a fresh deadline once one has settled', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		receiveStatus( { siteId }, COMPLETE_RESPONSE )( dispatch );

		jest.setSystemTime( start + TRANSFER_STATUS_POLL_DEADLINE_MS + 1 );
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).not.toHaveBeenCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
	} );
} );
