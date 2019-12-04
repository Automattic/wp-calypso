/**
 * External dependencies
 */
import { expect } from 'chai';
import { assign } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { site } from './fixtures/site';

/**
 * Module variables
 */
const DUMMY_SITE_ID = 1;
const DUMMY_MEDIA_OBJECT = { ID: 100, title: 'Image', extension: 'exe' };
const ERROR_GLOBAL_ITEM_ID = 0;

describe( 'MediaValidationStore', () => {
	let sandbox, MediaValidationStore, handler, Dispatcher, MediaValidationErrors;

	beforeAll( function() {
		Dispatcher = require( 'dispatcher' );
		MediaValidationErrors = require( '../constants' ).ValidationErrors;

		// Sinon
		sandbox = sinon.createSandbox();
		sandbox.spy( Dispatcher, 'register' );

		// Load store
		MediaValidationStore = require( '../validation-store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( () => {
		MediaValidationStore._errors = {};
	} );

	afterAll( function() {
		sandbox.restore();
	} );

	function dispatchError( error ) {
		handler( {
			action: {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT,
				error: {
					error: error,
				},
			},
		} );
	}

	function dispatchCreateMediaItem( action ) {
		handler( {
			action: assign(
				{
					type: 'CREATE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					data: DUMMY_MEDIA_OBJECT,
					site,
				},
				action
			),
		} );
	}

	function dispatchReceiveMediaItem( action ) {
		handler( {
			action: assign(
				{
					type: 'RECEIVE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					id: DUMMY_MEDIA_OBJECT.ID,
					data: DUMMY_MEDIA_OBJECT,
				},
				action
			),
		} );
	}

	function dispatchClearMediaValidationErrors( itemId ) {
		handler( {
			action: {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: itemId,
			},
		} );
	}

	describe( '#validateItem()', () => {
		let validateItem;

		beforeAll( function() {
			validateItem = MediaValidationStore.validateItem;
		} );

		test( 'should have no effect for a valid file', () => {
			validateItem( site, Object.assign( {}, DUMMY_MEDIA_OBJECT, { extension: 'gif' } ) );

			expect( MediaValidationStore._errors ).to.eql( {} );
		} );

		test( 'should set an error array for an invalid file', () => {
			validateItem( site, DUMMY_MEDIA_OBJECT );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ],
				},
			} );
		} );

		test( 'should set an error array for a file exceeding acceptable size', () => {
			validateItem(
				site,
				Object.assign( {}, DUMMY_MEDIA_OBJECT, { size: 2048, extension: 'gif' } )
			);

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE ],
				},
			} );
		} );

		test( 'should accumulate multiple validation errors', () => {
			validateItem( site, Object.assign( {}, DUMMY_MEDIA_OBJECT, { size: 2048 } ) );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_OBJECT.ID ]: [
						MediaValidationErrors.FILE_TYPE_UNSUPPORTED,
						MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE,
					],
				},
			} );
		} );
	} );

	describe( '#clearValidationErrors()', () => {
		let clearValidationErrors;

		beforeAll( function() {
			clearValidationErrors = MediaValidationStore.clearValidationErrors;
		} );

		test( 'should remove validation errors for a single item on a given site', () => {
			dispatchCreateMediaItem();

			clearValidationErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {},
			} );
		} );

		test( 'should remove all validation errors on a site if no item is specified', () => {
			dispatchCreateMediaItem();

			clearValidationErrors( DUMMY_SITE_ID );

			expect( MediaValidationStore._errors ).to.eql( {} );
		} );
	} );

	describe( '#clearValidationErrorsByType', () => {
		let clearValidationErrorsByType;

		beforeAll( function() {
			clearValidationErrorsByType = MediaValidationStore.clearValidationErrorsByType;
		} );

		test( 'should remove errors for all items containing that error type on a given site', () => {
			dispatchCreateMediaItem();
			dispatchCreateMediaItem( {
				data: assign( {}, DUMMY_MEDIA_OBJECT, { ID: DUMMY_MEDIA_OBJECT.ID + 1 } ),
			} );

			expect( Object.keys( MediaValidationStore.getAllErrors( DUMMY_SITE_ID ) ).length ).to.equal(
				2
			);

			clearValidationErrorsByType( DUMMY_SITE_ID, MediaValidationErrors.FILE_TYPE_UNSUPPORTED );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {},
			} );
		} );
	} );

	describe( '#getAllErrors()', () => {
		test( 'should return an empty object when no errors exist', () => {
			const errors = MediaValidationStore.getAllErrors( DUMMY_SITE_ID );

			expect( errors ).to.eql( {} );
		} );

		test( 'should return an object of errors', () => {
			dispatchCreateMediaItem();
			const errors = MediaValidationStore.getAllErrors( DUMMY_SITE_ID );

			expect( errors ).to.eql( {
				[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ],
			} );
		} );
	} );

	describe( '#getErrors()', () => {
		test( 'should return an empty array when no errors exist', () => {
			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.be.an.instanceof( Array );
			expect( errors ).to.be.empty;
		} );

		test( 'should return an array of errors', () => {
			dispatchCreateMediaItem();
			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ] );
		} );
	} );

	describe( '.dispatchToken', () => {
		test( 'should expose its dispatcher ID', () => {
			expect( MediaValidationStore.dispatchToken ).to.not.be.undefined;
		} );

		test( 'should emit a change event when receiving an item with an error', done => {
			MediaValidationStore.once( 'change', done );

			dispatchCreateMediaItem();
		} );

		test( 'should emit a change event when clearing validation errors', done => {
			MediaValidationStore.once( 'change', done );

			dispatchClearMediaValidationErrors();
		} );

		test( 'should detect a 404 error from received item', () => {
			dispatchReceiveMediaItem( {
				error: {
					statusCode: 400,
					errors: [
						{
							error: 'http_404',
							file: 'https://wordpress.com/invalid.gif',
							message: 'Not Found',
						},
					],
				},
			} );
			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.UPLOAD_VIA_URL_404 ] );
		} );

		test( 'should detect a not enough space error from received item', () => {
			dispatchReceiveMediaItem( {
				error: {
					statusCode: 400,
					errors: [
						{
							error: 'upload_error',
							file: 'https://wordpress.com/hifive.gif',
							message: 'Not enough space to upload. 20 KB needed.',
						},
					],
				},
			} );
			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.NOT_ENOUGH_SPACE ] );
		} );

		test( 'should detect an exceeds plan storage limit error from received item', () => {
			dispatchReceiveMediaItem( {
				error: {
					statusCode: 400,
					errors: [
						{
							error: 'upload_error',
							file: 'https://wordpress.com/hifive.gif',
							message: 'You have used your space quota. Please delete files before uploading.',
						},
					],
				},
			} );
			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT ] );
		} );

		test( 'should detect general server error from received item', () => {
			dispatchReceiveMediaItem( {
				error: new Error(),
			} );
			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.SERVER_ERROR ] );
		} );

		test( 'should set errors into the action object explicitly', () => {
			const action = {
				type: 'CREATE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT,
				site,
			};

			handler( { action } );

			expect( action.error ).to.eql( {
				[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ],
			} );
		} );

		test( 'should preserve existing errors when detecting a new one', () => {
			const action = {
				type: 'CREATE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,

				data: DUMMY_MEDIA_OBJECT,
				site,
			};

			handler( {
				action: {
					type: 'CREATE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					data: assign( {}, DUMMY_MEDIA_OBJECT, { ID: 101 } ),
					site,
				},
			} );

			handler( { action } );

			expect( action.error ).to.eql( {
				[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ],
				101: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ],
			} );
		} );

		test( 'should detect an external media error and set error on item ERROR_GLOBAL_ITEM_ID', () => {
			dispatchError( 'servicefail' );

			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, ERROR_GLOBAL_ITEM_ID );

			expect( errors ).to.eql( [ MediaValidationErrors.SERVICE_FAILED ] );
		} );

		test( 'should detect an expired auth token and set error on item ERROR_GLOBAL_ITEM_ID', () => {
			dispatchError( 'keyring_token_error' );

			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, ERROR_GLOBAL_ITEM_ID );

			expect( errors ).to.eql( [ MediaValidationErrors.SERVICE_AUTH_FAILED ] );
		} );

		test( 'should require an action ID for all errors other than external media', () => {
			dispatchError( 'someothererror' );

			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, ERROR_GLOBAL_ITEM_ID );

			expect( errors ).to.eql( [] );
		} );

		test( 'should remove all validation errors when changing the data source', () => {
			dispatchError( 'servicefail' );
			handler( { action: { type: 'CHANGE_MEDIA_SOURCE', siteId: DUMMY_SITE_ID } } );

			const errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, ERROR_GLOBAL_ITEM_ID );

			expect( errors ).to.eql( [] );
		} );
	} );
} );
