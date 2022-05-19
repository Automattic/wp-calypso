import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestStatus, receiveStatus } from '../';

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
	} );

	test( 'should dispatch set status action', () => {
		const dispatch = jest.fn();
		receiveStatus( { siteId }, COMPLETE_RESPONSE )( dispatch );
		expect( dispatch ).toBeCalledTimes( 3 );
		expect( dispatch ).toBeCalledWith(
			setAutomatedTransferStatus( siteId, 'complete', 'hello-dolly' )
		);
	} );

	test( 'should dispatch tracks event if complete', () => {
		const dispatch = jest.fn();
		receiveStatus( { siteId }, COMPLETE_RESPONSE )( dispatch );
		expect( dispatch ).toBeCalledTimes( 3 );
		expect( dispatch ).toBeCalledWith(
			recordTracksEvent( 'calypso_automated_transfer_complete', {
				context: 'plugin_upload',
				transfer_id: 1,
				uploaded_plugin_slug: 'hello-dolly',
			} )
		);
	} );

	test( 'should request status again if not complete', () => {
		jest.useFakeTimers();
		const dispatch = jest.fn();
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toBeCalledTimes( 2 );
		expect( dispatch ).toBeCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );
} );
