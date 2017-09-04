/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	initiateTransfer,
	receiveResponse,
	receiveError,
} from '../';
import {
	getAutomatedTransferStatus,
} from 'state/automated-transfer/actions';
import {
	pluginUploadError,
} from 'state/plugins/upload/actions';

const siteId = 1916284;

const ERROR_RESPONSE = {
	error: 'invalid_input',
	message: 'Invalid file type.',
};

describe( 'initiateTransfer', () => {
	it( 'should dispatch an http request', () => {
		const dispatch = sinon.spy();
		initiateTransfer( { dispatch }, { siteId, pluginZip: 'foo' } );
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
		expect( dispatch ).to.have.been.calledWith(
			pluginUploadError( siteId, ERROR_RESPONSE )
		);
	} );
} );
