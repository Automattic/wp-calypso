/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	updateUploadProgress,
	uploadComplete,
	uploadPlugin,
	receiveError,
} from '../';
import {
	completePluginUpload,
	pluginUploadError,
	updatePluginUploadProgress,
} from 'state/plugins/upload/actions';
import { PLUGIN_INSTALL_REQUEST_SUCCESS } from 'state/action-types';

const siteId = 77203074;
const pluginId = 'hello-dolly';

const SUCCESS_RESPONSE = deepFreeze( {
	active: false,
	author: 'blah',
	author_url: 'http://example.com',
	autoupdate: false,
	description: 'blah blah blah',
	id: 'hello-dolly/hello',
	name: 'Hello Dolly',
	network: false,
	plugin_url: 'http://wordpress.org/extend/plugins/hello-dolly/',
	slug: 'hello-dolly',
	version: '1.6',
} );

const ERROR_RESPONSE = deepFreeze( {
	error: 'folder_exists',
	message: 'folder_exists',
} );

describe( 'uploadPlugin', () => {
	it( 'should distpatch an http request', () => {
		const dispatch = sinon.spy();
		uploadPlugin( { dispatch }, { siteId, file: 'xyz' } );
		expect( dispatch ).to.have.been.calledWithMatch( {
			formData: [ [ 'zip[]', 'xyz' ] ],
			method: 'POST',
			path: `/sites/${ siteId }/plugins/new`,
		} );
	} );
} );

describe( 'uploadComplete', () => {
	it( 'should dispatch plugin upload complete action', () => {
		const dispatch = sinon.spy();
		uploadComplete( { dispatch }, { siteId }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			completePluginUpload( siteId, pluginId )
		);
	} );

	it( 'should dispatch plugin install request success', () => {
		const dispatch = sinon.spy();
		uploadComplete( { dispatch }, { siteId }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith( {
			type: PLUGIN_INSTALL_REQUEST_SUCCESS,
			siteId,
			pluginId,
			data: SUCCESS_RESPONSE,
		} );
	} );
} );

describe( 'receiveError', () => {
	it( 'should dispatch plugin upload error', () => {
		const dispatch = sinon.spy();
		receiveError( { dispatch }, { siteId }, ERROR_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			pluginUploadError( siteId, ERROR_RESPONSE )
		);
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
