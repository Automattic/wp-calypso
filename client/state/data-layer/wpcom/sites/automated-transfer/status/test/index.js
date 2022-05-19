import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { useFakeTimers } from 'calypso/test-helpers/use-sinon';
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
	let clock;
	useFakeTimers( ( fakeClock ) => ( clock = fakeClock ) );

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
		const dispatch = jest.fn();
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		clock.tick( 4000 );

		expect( dispatch ).toBeCalledTimes( 2 );
		expect( dispatch ).toBeCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );
} );
