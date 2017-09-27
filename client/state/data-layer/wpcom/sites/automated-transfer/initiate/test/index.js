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
import { getAutomatedTransferStatus } from 'state/automated-transfer/actions';
import {
	pluginUploadError,
	updatePluginUploadProgress,
} from 'state/plugins/upload/actions';

const siteId = 1916284;

const ERROR_RESPONSE = {
	error: 'invalid_input',
	message: 'Invalid file type.',
};

describe( 'initiateTransferWithPluginZip', () => {
	it( 'should dispatch an http request', () => {
		const dispatch = sinon.spy();
		initiateTransferWithPluginZip( { dispatch }, { siteId, pluginZip: 'foo' } );
		expect( dispatch ).to.have.been.calledWithMatch( {
			method: 'POST',
			path: `/sites/${ siteId }/automated-transfers/initiate`,
			formData: [ [ 'plugin_zip', 'foo' ] ],
		} );
	} );
} );

describe( 'receiveResponse', () => {
	it( 'should dispatch a status request', () => {
		const dispatch = sinon.spy();
		receiveResponse( { dispatch }, { siteId } );
		expect( dispatch ).to.have.been.calledWith(
			getAutomatedTransferStatus( siteId )
		);
	} );
} );

describe( 'receiveError', () => {
	it( 'should dispatch a plugin upload error', () => {
		const dispatch = sinon.spy();
		receiveError( { dispatch }, { siteId }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledThrice;
		expect( dispatch ).to.have.been.calledWith(
			pluginUploadError( siteId, ERROR_RESPONSE )
		);
	} );

	it( 'should dispatch an error notice', () => {
		const dispatch = sinon.spy();
		receiveError( { dispatch }, { siteId }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledThrice;
		expect( dispatch ).to.have.been.calledWithMatch( {
			notice: { text: 'Not a valid zip file.' }
		} );
	} );
} );

describe( 'updateUploadProgress', () => {
	it( 'should dispatch plugin upload progress update', () => {
		const dispatch = sinon.spy();
		updateUploadProgress( { dispatch }, { siteId }, { loaded: 200, total: 400 } );
		expect( dispatch ).to.have.been.calledWith(
			updatePluginUploadProgress( siteId, 50 )
		);
	} );
} );
