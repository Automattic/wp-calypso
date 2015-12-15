/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	ReactInjection = require( 'react/lib/ReactInjection' ),
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	expect = require( 'chai' ).use( sinonChai ).expect;

/**
 * Internal dependencies
 */
var ModalViews = require( '../../constants' ).Views,
	i18n = require( 'lib/mixins/i18n' ),
	EditorMediaModal;

/**
 * Module variables
 */
var DUMMY_SITE = { ID: 1 },
	DUMMY_MEDIA = [
		{ ID: 100, date: '2015-06-19T11:36:09-04:00' },
		{ ID: 200, date: '2015-06-19T09:36:09-04:00' }
	],
	EMPTY_COMPONENT;

EMPTY_COMPONENT = React.createClass( {
	render: function() {
		return <div />;
	}
} );

describe( 'EditorMediaModal', function() {
	var sandbox, deleteMedia, accept;

	before( function() {
		// i18n
		i18n.initialize();
		ReactInjection.Class.injectMixin( i18n.mixin );

		// Sinon
		sandbox = sinon.sandbox.create();
		deleteMedia = sandbox.stub();
		accept = sandbox.stub().callsArgWithAsync( 1, true );

		// Mockery
		mockery.enable( { warnOnReplace: false, warnOnUnregistered: false } );
		mockery.registerMock( 'my-sites/media-library', EMPTY_COMPONENT );
		mockery.registerMock( './detail', EMPTY_COMPONENT );
		mockery.registerMock( './gallery', EMPTY_COMPONENT );
		mockery.registerMock( './secondary-actions', EMPTY_COMPONENT );
		mockery.registerMock( 'components/dialog', EMPTY_COMPONENT );
		mockery.registerMock( 'components/popover', EMPTY_COMPONENT );
		mockery.registerMock( 'lib/accept', accept );
		mockery.registerMock( 'component-closest', {} );
		mockery.registerMock( 'lib/media/actions', { delete: deleteMedia } );

		EditorMediaModal = require( '../../' );
	} );

	beforeEach( function() {
		sandbox.reset();
		ReactDom.unmountComponentAtNode( document.body );
	} );

	after( function() {
		mockery.deregisterAll();
		mockery.disable();
		sandbox.restore();
	} );

	it( 'should prompt to delete a single item from the list view', function( done ) {
		var media = DUMMY_MEDIA.slice( 0, 1 ),
			tree;

		tree = ReactDom.render(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ media } />,
			document.body
		);
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to permanently delete this item?' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, media );
			done();
		} );
	} );

	it( 'should prompt to delete multiple items from the list view', function( done ) {
		var tree = ReactDom.render(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } />,
			document.body
		);
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to permanently delete these items?' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, DUMMY_MEDIA );
			done();
		} );
	} );

	it( 'should prompt to delete a single item from the detail view', function( done ) {
		var media = DUMMY_MEDIA[ 0 ],
			tree;

		tree = ReactDom.render(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ [ media ] } />,
			document.body
		);
		tree.setView( ModalViews.DETAIL );
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to permanently delete this item?' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, media );
			done();
		} );
	} );

	it( 'should prompt to delete a single item from the detail view, even when multiple selected', function( done ) {
		var tree = ReactDom.render(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } />,
			document.body
		);
		tree.setView( ModalViews.DETAIL );
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to permanently delete this item?' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, DUMMY_MEDIA[ 0 ] );
			done();
		} );
	} );

	it( 'should return to the list view after deleting the only item in detail view', function( done ) {
		var tree = ReactDom.render(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA.slice( 0, 1 ) } />,
			document.body
		);
		tree.setView( ModalViews.DETAIL );
		tree.deleteMedia();

		process.nextTick( function() {
			expect( tree.state.activeView ).to.equal( ModalViews.LIST );
			done();
		} );
	} );

	it( 'should revert to an earlier media item when the last item is deleted from detail view', function( done ) {
		var tree = ReactDom.render(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } />,
			document.body
		);
		tree.setView( ModalViews.DETAIL );
		tree.setDetailSelectedIndex( 1 );
		tree.deleteMedia();

		process.nextTick( function() {
			expect( tree.state.activeView ).to.equal( ModalViews.DETAIL );
			expect( tree.state.detailSelectedIndex ).to.equal( 0 );
			done();
		} );
	} );
} );
