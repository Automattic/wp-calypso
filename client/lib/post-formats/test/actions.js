/* eslint-disable vars-on-top */

/**
 * External dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	sinon = require( 'sinon' ),
	mockery = require( 'mockery' ),
	sinonChai = require( 'sinon-chai' );

chai.use( sinonChai );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' );

var DUMMY_SITE_ID = 1,
	DUMMY_API_RESPONSE = { formats: { image: 'Image' } };

describe( 'PostFormatsActions', function() {
	var wpcomPostFormatsList, PostFormatsActions, sandbox;

	before( function() {
		sandbox = sinon.sandbox.create();
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( Dispatcher, 'handleServerAction' );
		wpcomPostFormatsList = sandbox.stub().callsArgWithAsync( 0, null, DUMMY_API_RESPONSE );

		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/wp', {
			undocumented: function() {
				return {
					site: function() {
						return {
							postFormatsList: wpcomPostFormatsList
						};
					}
				};
			}
		} );

		PostFormatsActions = require( '../actions' );
	} );

	beforeEach( function() {
		sandbox.reset();
	} );

	after( function() {
		sandbox.restore();

		mockery.deregisterAll();
		mockery.disable();
	} );

	describe( '#fetch()', function() {
		it( 'should trigger a request to the REST API', function( done ) {
			PostFormatsActions.fetch( DUMMY_SITE_ID );

			expect( wpcomPostFormatsList ).to.have.been.calledOnce;
			expect( Dispatcher.handleViewAction ).to.have.been.calledOnce;
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'FETCH_POST_FORMATS',
				siteId: DUMMY_SITE_ID
			} );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledOnce;
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_POST_FORMATS',
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE.formats
				} );

				done();
			} );
		} );
	} );
} );
