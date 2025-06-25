import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import { PLUGIN_INSTALL_REQUEST_SUCCESS } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
	test( 'should return expected actions for a muted error (folder_exists)', () => {
		const error = { error: 'folder_exists', message: 'folder_exists' };
		const actions = receiveError( { siteId }, error );

		expect( actions ).toEqual( [
			recordTracksEvent( 'calypso_plugin_upload_error', {
				error_code: error.error,
				error_message: error.message,
			} ),
			pluginUploadError( siteId, error ),
		] );

		// Should not contain error notice
		expect( actions ).not.toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					type: 'NOTICE_ADD',
				} ),
			] )
		);
	} );

	test( 'should return expected actions for a muted error (plugin_malicious)', () => {
		const error = { error: 'plugin_malicious', message: 'plugin_malicious' };
		const actions = receiveError( { siteId }, error );

		expect( actions ).toEqual( [
			recordTracksEvent( 'calypso_plugin_upload_error', {
				error_code: error.error,
				error_message: error.message,
			} ),
			pluginUploadError( siteId, error ),
		] );

		// Should not contain error notice
		expect( actions ).not.toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					type: 'NOTICE_ADD',
				} ),
			] )
		);
	} );

	test( 'should return expected actions including error notice for non-muted error', () => {
		const error = { error: 'too_large', message: 'File is too large' };
		const actions = receiveError( { siteId }, error );

		// Test each action individually to handle dynamic notice ID
		expect( actions[ 0 ] ).toEqual(
			recordTracksEvent( 'calypso_plugin_upload_error', {
				error_code: error.error,
				error_message: error.message,
			} )
		);
		expect( actions[ 1 ] ).toEqual( pluginUploadError( siteId, error ) );
		expect( actions[ 2 ] ).toEqual(
			expect.objectContaining( {
				type: 'NOTICE_CREATE',
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'The plugin zip file must be smaller than 10MB.',
					showDismiss: true,
				} ),
			} )
		);
	} );

	test( 'should return expected actions for unknown error', () => {
		const error = { error: 'unknown_error', message: 'Something went wrong' };
		const actions = receiveError( { siteId }, error );

		// Test each action individually to handle dynamic notice ID
		expect( actions[ 0 ] ).toEqual(
			recordTracksEvent( 'calypso_plugin_upload_error', {
				error_code: error.error,
				error_message: error.message,
			} )
		);
		expect( actions[ 1 ] ).toEqual( pluginUploadError( siteId, error ) );
		expect( actions[ 2 ] ).toEqual(
			expect.objectContaining( {
				type: 'NOTICE_CREATE',
				notice: expect.objectContaining( {
					status: 'is-error',
					text: 'Upload problem: unknown_error.',
					showDismiss: true,
				} ),
			} )
		);
	} );
} );

describe( 'updateUploadProgress', () => {
	test( 'should return a plugin upload progress update action', () => {
		const action = updateUploadProgress( { siteId }, { loaded: 200, total: 400 } );
		expect( action ).toEqual( updatePluginUploadProgress( siteId, 50 ) );
	} );
} );
