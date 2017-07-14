/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	clearPluginUpload,
	completePluginUpload,
	pluginUploadError,
	uploadPlugin,
} from '../actions';
import {
	uploadedPluginId,
	uploadError,
	inProgress,
} from '../reducer';

const siteId = 2916284;
const pluginId = 'hello-dolly';
const error = {
	error: 'folder_exists',
	message: 'folder_exists',
};

describe( 'uploadedPluginId', () => {
	it( 'should contain plugin id after upload completes', () => {
		const state = uploadedPluginId( {}, completePluginUpload( siteId, pluginId ) );
		expect( state[ siteId ] ).to.equal( pluginId );
	} );

	it( 'should be empty after clearing an upload', () => {
		const state = uploadedPluginId( { [ siteId ]: pluginId }, clearPluginUpload( siteId ) );
		expect( state[ siteId ] ).to.be.null;
	} );

	it( 'should be empty after failed upload', () => {
		const state = uploadedPluginId( { [ siteId ]: pluginId }, pluginUploadError( siteId, error ) );
		expect( state[ siteId ] ).to.be.null;
	} );
} );

describe( 'uploadError', () => {
	it( 'should contain error after failed upload', () => {
		const state = uploadError( {}, pluginUploadError( siteId, error ) );
		expect( state[ siteId ] ).to.deep.equal( error );
	} );

	it( 'should be empty after successful upload', () => {
		const state = uploadError( { [ siteId ]: error }, completePluginUpload( siteId, pluginId ) );
		expect( state[ siteId ] ).to.be.null;
	} );

	it( 'should be empty on clear', () => {
		const state = uploadError( { [ siteId ]: error }, clearPluginUpload( siteId ) );
		expect( state[ siteId ] ).to.be.null;
	} );

	it( 'should be empty on upload start', () => {
		const state = uploadError( { [ siteId ]: error }, uploadPlugin( siteId ) );
		expect( state[ siteId ] ).to.be.null;
	} );
} );

describe( 'inProgress', () => {
	it( 'should be true on upload start', () => {
		const state = inProgress( {}, uploadPlugin( siteId ) );
		expect( state[ siteId ] ).to.be.true;
	} );

	it( 'should not be true after completed upload', () => {
		const state = inProgress( { [ siteId ]: error }, completePluginUpload( siteId, pluginId ) );
		expect( state[ siteId ] ).to.not.be.true;
	} );

	it( 'should not be true after upload error', () => {
		const state = inProgress( { [ siteId ]: error }, pluginUploadError( siteId, error ) );
		expect( state[ siteId ] ).to.not.be.true;
	} );

	it( 'should not be true after upload clear', () => {
		const state = inProgress( { [ siteId ]: error }, clearPluginUpload( siteId ) );
		expect( state[ siteId ] ).to.not.be.true;
	} );
} );
