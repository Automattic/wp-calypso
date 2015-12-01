/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	rewire = require( 'rewire' );

chai.use( sinonChai );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	PostEditStore = require( '../post-edit-store' ),
	PostsStore = require( '../posts-store' ),
	wpcom = require( 'lib/wp' );

/**
 * Internal dependencies (rewire)
 */
var PostActions = rewire( '../actions' );

describe( 'PostActions', function() {
	var sandbox;

	before( function() {
		sandbox = sinon.sandbox.create();
	} );

	beforeEach( function() {
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( PostEditStore, 'get' ).returns( {
			metadata: []
		} );
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( '#updateMetadata()', function() {
		it( 'should dispatch a post edit with a new metadata value', function() {
			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} );
		} );

		it( 'accepts an object of key value pairs', function() {
			PostActions.updateMetadata( {
				foo: 'bar',
				baz: 'qux'
			} );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'foo', value: 'bar', operation: 'update' },
						{ key: 'baz', value: 'qux', operation: 'update' }
					]
				}
			} );
		} );

		it( 'should include metadata already existing on the post object', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'other', value: '1234' }
				]
			} );

			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'other', value: '1234' },
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} );
		} );

		it( 'should include metadata edits made previously', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'other', operation: 'delete' }
				]
			} );

			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'other', operation: 'delete' },
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} );
		} );

		it( 'should not duplicate existing metadata edits', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'bar', value: 'foo' },
					{ key: 'foo', value: 'baz', operation: 'delete' }
				]
			} );

			PostActions.updateMetadata( 'foo', 'bar' );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'bar', value: 'foo' },
						{ key: 'foo', value: 'bar', operation: 'update' }
					]
				}
			} );
		} );
	} );

	describe( '#deleteMetadata()', function() {
		it( 'should dispatch a post edit with a deleted metadata', function() {
			PostEditStore.get.restore();
			sandbox.stub( PostEditStore, 'get' ).returns( {
				metadata: [
					{ key: 'bar', value: 'foo' }
				]
			} );
			PostActions.deleteMetadata( 'foo' );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'bar', value: 'foo' },
						{ key: 'foo', operation: 'delete' }
					]
				}
			} );
		} );

		it( 'should accept an array of metadata keys to delete', function() {
			PostActions.deleteMetadata( [ 'foo', 'bar' ] );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'EDIT_POST',
				post: {
					metadata: [
						{ key: 'foo', operation: 'delete', },
						{ key: 'bar', operation: 'delete' }
					]
				}
			} );
		} );
	} );

	describe( '#saveEdited()', function() {
		it( 'should not send a request if the post has no content', function( done ) {
			var spy = sandbox.spy();
			sandbox.stub( PostEditStore, 'hasContent' ).returns( false );

			PostActions.saveEdited( null, spy );

			setTimeout( function() {
				expect( spy ).to.have.been.calledOnce;
				expect( spy.getCall( 0 ).args[ 0 ] ).to.be.an.instanceof( Error );
				expect( spy.getCall( 0 ).args[ 0 ].message ).to.equal( 'NO_CONTENT' );
				expect( spy.getCall( 0 ).args[ 1 ] ).to.eql( PostEditStore.get() );
				done();
			}, 0 );
		} );

		it( 'should not send a request if there are no changed attributes', function( done ) {
			var spy = sandbox.spy();
			sandbox.stub( PostEditStore, 'hasContent' ).returns( true );
			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( {} );

			PostActions.saveEdited( null, spy );

			setTimeout( function() {
				expect( spy ).to.have.been.calledOnce;
				expect( spy.getCall( 0 ).args[ 0 ] ).to.be.an.instanceof( Error );
				expect( spy.getCall( 0 ).args[ 0 ].message ).to.equal( 'NO_CHANGE' );
				expect( spy.getCall( 0 ).args[ 1 ] ).to.eql( PostEditStore.get() );
				done();
			}, 0 );
		} );

		it( 'should normalize attributes and call the API', function( done ) {
			const normalizeOriginal = PostActions.__get__( 'normalizeApiAttributes' );
			const normalizeSpy = sandbox.spy( normalizeOriginal );
			PostActions.__set__( 'normalizeApiAttributes', normalizeSpy );

			sandbox.stub( PostEditStore, 'hasContent' ).returns( true );

			const changedAttributes = {
				ID: 777,
				site_ID: 123,
				author: {
					ID: 3
				},
				title: 'OMG Unicorns',
				categories: [ 199, 200 ]
			};
			sandbox.stub( PostEditStore, 'getChangedAttributes' ).returns( changedAttributes );

			sandbox.stub( wpcom, 'site' ).returns( {
				post: function() {
					return {
						add: function( query, changedAttributes, callback ) {
							callback( null, {} );
						}
					};
				}
			} );

			PostActions.saveEdited( null, function( error, post ) {
				PostActions.__set__( 'normalizeApiAttributes', normalizeOriginal );
				expect( normalizeSpy ).to.have.been.calledWith( changedAttributes );
				expect( normalizeSpy.returnValues[0] ).to.deep.equal( {
					ID: 777,
					site_ID: 123,
					author: 3,
					title: 'OMG Unicorns',
					categories_by_id: [ '199', '200' ]
				} );
				done();
			} );
		} );
	} );
} );
