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
	updatePluginUploadProgress,
	uploadPlugin,
} from '../actions';
import { inProgress, progressPercent, uploadedPluginId, uploadError } from '../reducer';
import {
	initiateAutomatedTransferWithPluginZip,
	setAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/actions';

const siteId = 2916284;
const pluginId = 'hello-dolly';
const error = {
	error: 'folder_exists',
	message: 'folder_exists',
};

describe( 'uploadedPluginId', () => {
	test( 'should contain plugin id after upload completes', () => {
		const state = uploadedPluginId( {}, completePluginUpload( siteId, pluginId ) );
		expect( state[ siteId ] ).to.equal( pluginId );
	} );

	test( 'should contain plugin id after transfer status', () => {
		const state = uploadedPluginId(
			{},
			setAutomatedTransferStatus( siteId, 'complete', pluginId )
		);
		expect( state[ siteId ] ).to.equal( pluginId );
	} );

	test( 'should be empty after upload start', () => {
		const state = uploadedPluginId( {}, uploadPlugin( siteId ) );
		expect( state[ siteId ] ).to.be.null;
	} );

	test( 'should be empty after clearing an upload', () => {
		const state = uploadedPluginId( { [ siteId ]: pluginId }, clearPluginUpload( siteId ) );
		expect( state[ siteId ] ).to.be.null;
	} );

	test( 'should be empty after failed upload', () => {
		const state = uploadedPluginId( { [ siteId ]: pluginId }, pluginUploadError( siteId, error ) );
		expect( state[ siteId ] ).to.be.null;
	} );
} );

describe( 'uploadError', () => {
	test( 'should contain error after failed upload', () => {
		const state = uploadError( {}, pluginUploadError( siteId, error ) );
		expect( state[ siteId ] ).to.deep.equal( error );
	} );

	test( 'should be empty after successful upload', () => {
		const state = uploadError( { [ siteId ]: error }, completePluginUpload( siteId, pluginId ) );
		expect( state[ siteId ] ).to.be.null;
	} );

	test( 'should be empty on clear', () => {
		const state = uploadError( { [ siteId ]: error }, clearPluginUpload( siteId ) );
		expect( state[ siteId ] ).to.be.null;
	} );

	test( 'should be empty on upload start', () => {
		const state = uploadError( { [ siteId ]: error }, uploadPlugin( siteId ) );
		expect( state[ siteId ] ).to.be.null;
	} );
} );

describe( 'progressPercent', () => {
	test( 'should be zero on upload start', () => {
		const state = progressPercent( { [ siteId ]: 50 }, uploadPlugin( siteId ) );
		expect( state[ siteId ] ).to.equal( 0 );
	} );

	test( 'should be zero on upload clear', () => {
		const state = progressPercent( { [ siteId ]: 50 }, clearPluginUpload( siteId ) );
		expect( state[ siteId ] ).to.equal( 0 );
	} );

	test( 'should be zero on upload error', () => {
		const state = progressPercent( { [ siteId ]: 50 }, pluginUploadError( siteId, error ) );
		expect( state[ siteId ] ).to.equal( 0 );
	} );

	test( 'should contain progress after progress update', () => {
		const state = progressPercent( {}, updatePluginUploadProgress( siteId, 50 ) );
		expect( state[ siteId ] ).to.equal( 50 );
	} );
} );

describe( 'inProgress', () => {
	test( 'should be true on upload start', () => {
		const state = inProgress( {}, uploadPlugin( siteId ) );
		expect( state[ siteId ] ).to.be.true;
	} );

	test( 'should not be true after completed upload', () => {
		const state = inProgress( { [ siteId ]: true }, completePluginUpload( siteId, pluginId ) );
		expect( state[ siteId ] ).to.not.be.true;
	} );

	test( 'should not be true after upload error', () => {
		const state = inProgress( { [ siteId ]: true }, pluginUploadError( siteId, error ) );
		expect( state[ siteId ] ).to.not.be.true;
	} );

	test( 'should not be true after upload clear', () => {
		const state = inProgress( { [ siteId ]: true }, clearPluginUpload( siteId ) );
		expect( state[ siteId ] ).to.not.be.true;
	} );

	test( 'should be true on transfer start', () => {
		const state = inProgress( {}, initiateAutomatedTransferWithPluginZip( siteId ) );
		expect( state[ siteId ] ).to.be.true;
	} );

	test( 'should not be true after completed transfer', () => {
		const state = inProgress(
			{ [ siteId ]: true },
			setAutomatedTransferStatus( siteId, 'complete' )
		);
		expect( state[ siteId ] ).to.not.be.true;
	} );
} );
