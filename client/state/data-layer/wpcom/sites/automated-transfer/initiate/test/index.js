/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	initiateTransferWithPluginZip,
	receiveResponse,
	receiveError,
	updateUploadProgress,
} from '../';
import { recordTracksEvent } from 'state/analytics/actions';
import { fetchAutomatedTransferStatus } from 'state/automated-transfer/actions';
import { pluginUploadError, updatePluginUploadProgress } from 'state/plugins/upload/actions';

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
		const dispatch = sinon.spy();
		initiateTransferWithPluginZip( { dispatch }, { siteId, pluginZip: 'foo' } );
		expect( dispatch ).to.have.been.calledWithMatch( {
			method: 'POST',
			path: `/sites/${ siteId }/automated-transfers/initiate`,
			formData: [ [ 'plugin_zip', 'foo' ] ],
		} );
	} );

	test( 'should dispatch a tracks call', () => {
		const dispatch = sinon.spy();
		initiateTransferWithPluginZip( { dispatch }, { siteId, pluginZip: 'foo' } );
		expect( dispatch ).to.have.been.calledWith(
			recordTracksEvent( 'calypso_automated_transfer_inititate_transfer', {
				context: 'plugin_upload',
			} )
		);
	} );
} );

describe( 'receiveResponse', () => {
	test( 'should dispatch a status request', () => {
		const dispatch = sinon.spy();
		receiveResponse( { dispatch }, { siteId }, INITIATE_SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith( fetchAutomatedTransferStatus( siteId ) );
	} );

	test( 'should dispatch a tracks call', () => {
		const dispatch = sinon.spy();
		receiveResponse( { dispatch }, { siteId }, INITIATE_SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			recordTracksEvent( 'calypso_automated_transfer_inititate_success', {
				context: 'plugin_upload',
			} )
		);
	} );

	test( 'should dispatch error notice on unsuccessful initiation', () => {
		const dispatch = sinon.spy();
		receiveResponse( { dispatch }, { siteId }, INITIATE_FAILURE_RESPONSE );
		expect( dispatch ).to.have.been.calledWithMatch( {
			notice: { text: 'The uploaded file is not a valid plugin.' },
		} );
	} );

	test( 'should dispatch a tracks call on unsuccessful initiation', () => {
		const dispatch = sinon.spy();
		receiveResponse( { dispatch }, { siteId }, INITIATE_FAILURE_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			recordTracksEvent( 'calypso_automated_transfer_inititate_failure', {
				context: 'plugin_upload',
				error: 'api_success_false',
			} )
		);
	} );
} );

describe( 'receiveError', () => {
	test( 'should dispatch a plugin upload error', () => {
		const dispatch = sinon.spy();
		receiveError( { dispatch }, { siteId }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith( pluginUploadError( siteId, ERROR_RESPONSE ) );
	} );

	test( 'should dispatch an error notice', () => {
		const dispatch = sinon.spy();
		receiveError( { dispatch }, { siteId }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWithMatch( {
			notice: { text: 'The uploaded file is not a valid zip.' },
		} );
	} );

	test( 'should dispatch a tracks call', () => {
		const dispatch = sinon.spy();
		receiveError( { dispatch }, { siteId }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			recordTracksEvent( 'calypso_automated_transfer_inititate_failure', {
				context: 'plugin_upload',
				error: 'invalid_input',
			} )
		);
	} );
} );

describe( 'updateUploadProgress', () => {
	test( 'should dispatch plugin upload progress update', () => {
		const dispatch = sinon.spy();
		updateUploadProgress( { dispatch }, { siteId }, { loaded: 200, total: 400 } );
		expect( dispatch ).to.have.been.calledWith( updatePluginUploadProgress( siteId, 50 ) );
	} );
} );
