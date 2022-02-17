import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import { PLUGIN_INSTALL_REQUEST_SUCCESS } from 'calypso/state/action-types';
import {
	completePluginUpload,
	pluginUploadError,
	updatePluginUploadProgress,
} from 'calypso/state/plugins/upload/actions';
import { updateUploadProgress, uploadComplete, uploadPlugin, receiveError } from '../';

const siteId = 77203074;
const pluginId = 'hello-dolly';

const SUCCESS_RESPONSE = {
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
};

const ERROR_RESPONSE = {
	error: 'folder_exists',
	message: 'folder_exists',
};

const UNKNOWN_ERROR_RESPONSE = {
	error: 'unknown_error',
	message: 'unknown_error',
};

describe( 'uploadPlugin', () => {
	test( 'should return an http request action', () => {
		const action = uploadPlugin( { siteId, file: 'xyz' } );
		expect( action ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					formData: [ [ 'zip[]', 'xyz' ] ],
					method: 'POST',
					path: `/sites/${ siteId }/plugins/new`,
				} ),
			] )
		);
	} );
} );

describe( 'uploadComplete', () => {
	const getState = jest.fn();

	test( 'should return a plugin upload complete action', () => {
		const dispatch = jest.fn();
		uploadComplete( { siteId }, SUCCESS_RESPONSE )( dispatch, getState );
		expect( dispatch ).toHaveBeenCalledWith( completePluginUpload( siteId, pluginId ) );
	} );

	test( 'should dispatch a receive installed plugin action', () => {
		const dispatch = jest.fn();

		uploadComplete( { siteId }, SUCCESS_RESPONSE )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith( {
			type: PLUGIN_INSTALL_REQUEST_SUCCESS,
			action: INSTALL_PLUGIN,
			siteId,
			pluginId: SUCCESS_RESPONSE.id,
			data: SUCCESS_RESPONSE,
		} );
	} );
} );

describe( 'receiveError', () => {
	test( 'should return a plugin upload error action for a known error', () => {
		const action = receiveError( { siteId }, ERROR_RESPONSE );
		expect( action ).toEqual(
			expect.arrayContaining( [ pluginUploadError( siteId, ERROR_RESPONSE ) ] )
		);
	} );
	test( 'should return a plugin upload error action for an unknown error', () => {
		const action = receiveError( { siteId }, UNKNOWN_ERROR_RESPONSE );
		expect( action ).toEqual(
			expect.arrayContaining( [ pluginUploadError( siteId, UNKNOWN_ERROR_RESPONSE ) ] )
		);
	} );
} );

describe( 'updateUploadProgress', () => {
	test( 'should return a plugin upload progress update action', () => {
		const action = updateUploadProgress( { siteId }, { loaded: 200, total: 400 } );
		expect( action ).toEqual( updatePluginUploadProgress( siteId, 50 ) );
	} );
} );
