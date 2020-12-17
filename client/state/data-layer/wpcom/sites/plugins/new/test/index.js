/**
 * Internal dependencies
 */
import { updateUploadProgress, uploadComplete, uploadPlugin, receiveError } from '../';
import Dispatcher from 'calypso/dispatcher';
import {
	completePluginUpload,
	pluginUploadError,
	updatePluginUploadProgress,
} from 'calypso/state/plugins/upload/actions';
import { getSite } from 'calypso/state/sites/selectors';

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

jest.mock( 'calypso/dispatcher' );
jest.mock( 'calypso/state/sites/selectors' );

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
	const site = {
		ID: siteId,
		URL: 'https://wordpress.com',
	};
	const getState = jest.fn();

	test( 'should return a plugin upload complete action', () => {
		const dispatch = jest.fn();
		uploadComplete( { siteId }, SUCCESS_RESPONSE )( dispatch, getState );
		expect( dispatch ).toHaveBeenCalledWith( completePluginUpload( siteId, pluginId ) );
	} );

	test( 'should dispatch a receive installed plugin action', () => {
		Dispatcher.handleServerAction.mockImplementation( () => {} );
		getSite.mockImplementation( () => site );
		const dispatch = jest.fn();

		uploadComplete( { siteId }, SUCCESS_RESPONSE )( dispatch, getState );

		expect( Dispatcher.handleServerAction ).toHaveBeenCalledWith( {
			type: 'RECEIVE_INSTALLED_PLUGIN',
			action: 'PLUGIN_UPLOAD',
			site,
			plugin: SUCCESS_RESPONSE,
			data: SUCCESS_RESPONSE,
		} );
	} );
} );

describe( 'receiveError', () => {
	test( 'should return a plugin upload error action', () => {
		const action = receiveError( { siteId }, ERROR_RESPONSE );
		expect( action ).toEqual(
			expect.arrayContaining( [ pluginUploadError( siteId, ERROR_RESPONSE ) ] )
		);
	} );
} );

describe( 'updateUploadProgress', () => {
	test( 'should return a plugin upload progress update action', () => {
		const action = updateUploadProgress( { siteId }, { loaded: 200, total: 400 } );
		expect( action ).toEqual( updatePluginUploadProgress( siteId, 50 ) );
	} );
} );
