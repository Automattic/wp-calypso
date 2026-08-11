import { SITE_REQUEST } from 'calypso/state/action-types';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	requestStatus,
	receiveStatus,
	clearPollDeadlines,
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
