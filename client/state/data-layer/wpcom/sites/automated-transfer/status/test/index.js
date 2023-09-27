import { SITE_REQUEST } from 'calypso/state/action-types';
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
		jest.useFakeTimers();
		const dispatch = jest.fn();
		receiveStatus( { siteId }, IN_PROGRESS_RESPONSE )( dispatch );
		jest.runAllTimers();

		expect( dispatch ).toHaveBeenCalledTimes( 2 );
		expect( dispatch ).toHaveBeenCalledWith( fetchAutomatedTransferStatus( siteId ) );
	} );
} );
