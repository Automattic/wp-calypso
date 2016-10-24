/**
 * External dependencies
 */
import { expect } from 'chai';
import assign from 'lodash/assign';
import mockery from 'mockery';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

/**
 * Module variables
 */
var DUMMY_SITE_ID = 1,
	DUMMY_MEDIA_OBJECT = { ID: 100, title: 'Image', extension: 'exe' };

describe( 'MediaValidationStore', function() {
	let sandbox, MediaValidationStore, handler, Dispatcher, MediaValidationErrors;

	useMockery();

	before( function() {
		Dispatcher = require( 'dispatcher' );
		MediaValidationErrors = require( '../constants' ).ValidationErrors;

		// Sinon
		sandbox = sinon.sandbox.create();
		sandbox.spy( Dispatcher, 'register' );

		// Mockery
		mockery.enable( { warnOnReplace: false, warnOnUnregistered: false } );
		mockery.registerMock( 'lib/sites-list', function() {
			return {
				getSite: function() {
					return {
						options: {
							allowed_file_types: [ 'gif', 'pdf', 'avi' ],
							max_upload_size: 1024
						}
					};
				}
			};
		} );

		// Load store
		MediaValidationStore = require( '../validation-store' );
		handler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	beforeEach( function() {
		MediaValidationStore._errors = {};
	} );

	after( function() {
		sandbox.restore();
	} );

	function dispatchCreateMediaItem( action ) {
		handler( {
			action: assign( {
				type: 'CREATE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT
			}, action )
		} );
	}

	function dispatchReceiveMediaItem( action ) {
		handler( {
			action: assign( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				id: DUMMY_MEDIA_OBJECT.ID,
				data: DUMMY_MEDIA_OBJECT
			}, action )
		} );
	}

	function dispatchClearMediaValidationErrors( itemId ) {
		handler( {
			action: {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: itemId
			}
		} );
	}

	describe( '#validateItem()', function() {
		var validateItem;

		before( function() {
			validateItem = MediaValidationStore.validateItem;
		} );

		it( 'should have no effect for a valid file', function() {
			validateItem( DUMMY_SITE_ID, Object.assign( {}, DUMMY_MEDIA_OBJECT, { extension: 'gif' } ) );

			expect( MediaValidationStore._errors ).to.eql( {} );
		} );

		it( 'should set an error array for an invalid file', function() {
			validateItem( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ]
				}
			} );
		} );

		it( 'should set an error array for a file exceeding acceptable size', function() {
			validateItem( DUMMY_SITE_ID, Object.assign( {}, DUMMY_MEDIA_OBJECT, { size: 2048, extension: 'gif' } ) );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE ]
				}
			} );
		} );

		it( 'should accumulate multiple validation errors', function() {
			validateItem( DUMMY_SITE_ID, Object.assign( {}, DUMMY_MEDIA_OBJECT, { size: 2048 } ) );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {
					[ DUMMY_MEDIA_OBJECT.ID ]: [
						MediaValidationErrors.FILE_TYPE_UNSUPPORTED,
						MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE
					]
				}
			} );
		} );
	} );

	describe( '#clearValidationErrors()', function() {
		var clearValidationErrors;

		before( function() {
			clearValidationErrors = MediaValidationStore.clearValidationErrors;
		} );

		it( 'should remove validation errors for a single item on a given site', function() {
			dispatchCreateMediaItem();

			clearValidationErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {}
			} );
		} );

		it( 'should remove all validation errors on a site if no item is specified', function() {
			dispatchCreateMediaItem();

			clearValidationErrors( DUMMY_SITE_ID );

			expect( MediaValidationStore._errors ).to.eql( {} );
		} );
	} );

	describe( '#clearValidationErrorsByType', function() {
		var clearValidationErrorsByType;

		before( function() {
			clearValidationErrorsByType = MediaValidationStore.clearValidationErrorsByType;
		} );

		it( 'should remove errors for all items containing that error type on a given site', function() {
			dispatchCreateMediaItem();
			dispatchCreateMediaItem( {
				data: assign( {}, DUMMY_MEDIA_OBJECT, { ID: DUMMY_MEDIA_OBJECT.ID + 1 } )
			} );

			expect( Object.keys( MediaValidationStore.getAllErrors( DUMMY_SITE_ID ) ).length ).to.equal( 2 );

			clearValidationErrorsByType( DUMMY_SITE_ID, MediaValidationErrors.FILE_TYPE_UNSUPPORTED );

			expect( MediaValidationStore._errors ).to.eql( {
				[ DUMMY_SITE_ID ]: {}
			} );
		} );
	} );

	describe( '#getAllErrors()', function() {
		it( 'should return an empty object when no errors exist', function() {
			var errors = MediaValidationStore.getAllErrors( DUMMY_SITE_ID );

			expect( errors ).to.eql( {} );
		} );

		it( 'should return an object of errors', function() {
			var errors;

			dispatchCreateMediaItem();
			errors = MediaValidationStore.getAllErrors( DUMMY_SITE_ID );

			expect( errors ).to.eql( {
				[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ]
			} );
		} );
	} );

	describe( '#getErrors()', function() {
		it( 'should return an empty array when no errors exist', function() {
			var errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.be.an.instanceof( Array );
			expect( errors ).to.be.empty;
		} );

		it( 'should return an array of errors', function() {
			var errors;

			dispatchCreateMediaItem();
			errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ] );
		} );
	} );

	describe( '.dispatchToken', function() {
		it( 'should expose its dispatcher ID', function() {
			expect( MediaValidationStore.dispatchToken ).to.not.be.undefined;
		} );

		it( 'should emit a change event when receiving an item with an error', function( done ) {
			MediaValidationStore.once( 'change', done );

			dispatchCreateMediaItem();
		} );

		it( 'should emit a change event when clearing validation errors', function( done ) {
			MediaValidationStore.once( 'change', done );

			dispatchClearMediaValidationErrors();
		} );

		it( 'should detect a 404 error from received item', function() {
			var errors;

			dispatchReceiveMediaItem( {
				error: {
					statusCode: 400,
					errors: [ {
						error: 'http_404',
						file: 'https://wordpress.com/invalid.gif',
						message: 'Not Found'
					} ]
				}
			} );
			errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.UPLOAD_VIA_URL_404 ] );
		} );

		it( 'should detect a not enough space error from received item', function() {
			var errors;

			dispatchReceiveMediaItem( {
				error: {
					statusCode: 400,
					errors: [ {
						error: 'upload_error',
						file: 'https://wordpress.com/hifive.gif',
						message: 'Not enough space to upload. 20 KB needed.'
					} ]
				}
			} );
			errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.NOT_ENOUGH_SPACE ] );
		} );

		it( 'should detect an exceeds plan storage limit error from received item', function() {
			var errors;

			dispatchReceiveMediaItem( {
				error: {
					statusCode: 400,
					errors: [ {
						error: 'upload_error',
						file: 'https://wordpress.com/hifive.gif',
						message: 'You have used your space quota. Please delete files before uploading.'
					} ]
				}
			} );
			errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT ] );
		} );

		it( 'should detect general server error from received item', function() {
			var errors;

			dispatchReceiveMediaItem( {
				error: new Error()
			} );
			errors = MediaValidationStore.getErrors( DUMMY_SITE_ID, DUMMY_MEDIA_OBJECT.ID );

			expect( errors ).to.eql( [ MediaValidationErrors.SERVER_ERROR ] );
		} );

		it( 'should set errors into the action object explicitly', function() {
			var action = {
				type: 'CREATE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT
			};

			handler( { action } );

			expect( action.error ).to.eql( {
				[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ]
			} );
		} );

		it( 'should preserve existing errors when detecting a new one', function() {
			var action = {
				type: 'CREATE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: DUMMY_MEDIA_OBJECT
			};

			handler( {
				action: {
					type: 'CREATE_MEDIA_ITEM',
					siteId: DUMMY_SITE_ID,
					data: assign( {}, DUMMY_MEDIA_OBJECT, { ID: 101 } )
				}
			} );

			handler( { action } );

			expect( action.error ).to.eql( {
				[ DUMMY_MEDIA_OBJECT.ID ]: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ],
				101: [ MediaValidationErrors.FILE_TYPE_UNSUPPORTED ]
			} );
		} );
	} );
} );
