/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	initiateTransferWithPluginZip,
	receiveResponse,
	receiveError,
	updateUploadProgress,
} from '../';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import {
	pluginUploadError,
	updatePluginUploadProgress,
} from 'calypso/state/plugins/upload/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

const siteId = 1916284;

const ERROR_RESPONSE = {
	error: 'invalid_input',
	message: 'Invalid file type.',
};

const INITIATE_SUCCESS_RESPONSE = {
	success: true,
	status: 'uploading',
	transfer_id: 1,
};

const INITIATE_FAILURE_RESPONSE = {
	success: false,
	status: '',
	transfer_id: 0,
};

describe( 'initiateTransferWithPluginZip', () => {
	test( 'should dispatch an http request', () => {
		const result = initiateTransferWithPluginZip( { siteId, pluginZip: 'foo' } );
		expect( result[ 1 ] ).toEqual(
			http(
				{
					method: 'POST',
					path: `/sites/${ siteId }/automated-transfers/initiate`,
					apiVersion: '1',
					formData: [ [ 'plugin_zip', 'foo' ] ],
				},
				{ siteId, pluginZip: 'foo' }
			)
		);
	} );

	test( 'should dispatch a tracks call', () => {
		const result = initiateTransferWithPluginZip( { siteId, pluginZip: 'foo' } );
		expect( result[ 0 ] ).toEqual(
			recordTracksEvent( 'calypso_automated_transfer_inititate_transfer', {
				context: 'plugin_upload',
			} )
		);
	} );
} );

describe( 'receiveResponse', () => {
	test( 'should dispatch a status request', () => {
		const result = receiveResponse( { siteId }, INITIATE_SUCCESS_RESPONSE );
		expect( result[ 1 ] ).toEqual( fetchAutomatedTransferStatus( siteId ) );
	} );

	test( 'should dispatch a tracks call', () => {
		const result = receiveResponse( { siteId }, INITIATE_SUCCESS_RESPONSE );
		expect( result[ 0 ] ).toEqual(
			recordTracksEvent( 'calypso_automated_transfer_inititate_success', {
				context: 'plugin_upload',
			} )
		);
	} );

	test( 'should dispatch error notice on unsuccessful initiation', () => {
		const result = receiveResponse( { siteId }, INITIATE_FAILURE_RESPONSE );
		expect( result[ 1 ].notice.text ).toBe( 'The uploaded file is not a valid plugin.' );
	} );

	test( 'should dispatch a tracks call on unsuccessful initiation', () => {
		const result = receiveResponse( { siteId }, INITIATE_FAILURE_RESPONSE );
		expect( result[ 0 ] ).toEqual(
			recordTracksEvent( 'calypso_automated_transfer_inititate_failure', {
				context: 'plugin_upload',
				error: 'api_success_false',
			} )
		);
	} );
} );

describe( 'receiveError', () => {
	test( 'should dispatch a plugin upload error', () => {
		const result = receiveError( { siteId }, ERROR_RESPONSE );
		expect( result[ 2 ] ).toEqual( pluginUploadError( siteId, ERROR_RESPONSE ) );
	} );

	test( 'should dispatch an error notice', () => {
		const result = receiveError( { siteId }, ERROR_RESPONSE );
		expect( result[ 1 ].notice.text ).toBe( 'The uploaded file is not a valid zip.' );
	} );

	test( 'should dispatch a tracks call', () => {
		const result = receiveError( { siteId }, ERROR_RESPONSE );
		expect( result[ 0 ] ).toEqual(
			recordTracksEvent( 'calypso_automated_transfer_inititate_failure', {
				context: 'plugin_upload',
				error: 'invalid_input',
			} )
		);
	} );
} );

describe( 'updateUploadProgress', () => {
	test( 'should dispatch plugin upload progress update', () => {
		const result = updateUploadProgress( { siteId }, { loaded: 200, total: 400 } );
		expect( result ).toEqual( updatePluginUploadProgress( siteId, 50 ) );
	} );
} );
