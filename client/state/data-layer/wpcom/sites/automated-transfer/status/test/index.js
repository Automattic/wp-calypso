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
};

const settledResponse = ( status ) => ( {
	blog_id: 1916284,
	status,
	uploaded_plugin_slug: 'hello-dolly',
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
		expect( dispatch ).toHaveBeenCalledWith(
			fetchAutomatedTransferStatus( siteId, expect.any( Number ) )
		);
	} );

	test( 'should start a deadline for a new poll chain', () => {
		const now = 1000000;
		jest.setSystemTime( now );
		const dispatch = jest.fn();

		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledWith(
			fetchAutomatedTransferStatus( siteId, now + TRANSFER_STATUS_POLL_DEADLINE_MS )
		);
	} );

	test( 'should carry the deadline through a poll chain', () => {
		const pollDeadline = 2000000;
		jest.setSystemTime( 1000000 );
		const dispatch = jest.fn();

		receiveStatus( { siteId, pollDeadline }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId, pollDeadline ) );
	} );

	test( 'should set client timeout when the deadline expires', () => {
		const pollDeadline = 1000000;
		jest.setSystemTime( pollDeadline );
		const dispatch = jest.fn();

		receiveStatus( { siteId, pollDeadline }, IN_PROGRESS_RESPONSE )( dispatch );

		expect( dispatch ).toHaveBeenLastCalledWith(
			setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, 'hello-dolly' )
		);
		expect( dispatch ).not.toHaveBeenCalledWith(
			fetchAutomatedTransferStatus( siteId, pollDeadline )
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
		jest.setSystemTime( 1000000 );
		const dispatch = jest.fn();

		receiveStatus( { siteId, pollDeadline: 999999 }, settledResponse( status ) )( dispatch );

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

		expect( dispatch ).not.toHaveBeenCalledWith(
			fetchAutomatedTransferStatus( siteId, expect.any( Number ) )
		);
	} );

	test( 'should apply the deadline to requests that carry none', () => {
		const start = 1000000;
		jest.setSystemTime( start );
		const dispatch = jest.fn();

		// Consumers re-dispatch without a deadline whenever the status changes. That must not
		// open a fresh window, or the wait is never bounded.
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
