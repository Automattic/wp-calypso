/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import mockery from 'mockery';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import { useSandbox } from 'test/helpers/use-sinon';

/**
 * Module variables
 */
const DUMMY_SITE = { ID: 1 };
const DUMMY_MEDIA = [
	{ ID: 100, date: '2015-06-19T11:36:09-04:00' },
	{ ID: 200, date: '2015-06-19T09:36:09-04:00' }
];
const EMPTY_COMPONENT = React.createClass( {
	render: function() {
		return <div />;
	}
} );

describe( 'EditorMediaModal', function() {
	let sandbox, i18n, ModalViews, deleteMedia, accept, EditorMediaModal;

	useMockery();
	useFakeDom();
	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		deleteMedia = sandbox.stub();
		accept = sandbox.stub().callsArgWithAsync( 1, true );
	} );

	before( function() {
		ModalViews = require( '../constants' ).Views;
		i18n = require( 'i18n-calypso' );

		// Mockery
		mockery.registerMock( 'my-sites/media-library', EMPTY_COMPONENT );
		mockery.registerMock( './detail', EMPTY_COMPONENT );
		mockery.registerMock( './gallery', EMPTY_COMPONENT );
		mockery.registerMock( './secondary-actions', EMPTY_COMPONENT );
		mockery.registerMock( 'components/dialog', EMPTY_COMPONENT );
		mockery.registerMock( 'components/popover', EMPTY_COMPONENT );
		mockery.registerMock( 'lib/accept', accept );
		mockery.registerMock( 'component-closest', {} );
		mockery.registerMock( 'lib/media/actions', { delete: deleteMedia } );

		EditorMediaModal = require( '../' );
		EditorMediaModal.prototype.translate = i18n.translate;
	} );

	it( 'should prompt to delete a single item from the list view', function( done ) {
		var media = DUMMY_MEDIA.slice( 0, 1 ),
			tree;

		tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ media } />
		).instance();
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to permanently delete this item?' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, media );
			done();
		} );
	} );

	it( 'should prompt to delete multiple items from the list view', function( done ) {
		var tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } />
		).instance();
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

		tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ [ media ] } />
		).instance();
		tree.setView( ModalViews.DETAIL );
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to permanently delete this item?' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, media );
			done();
		} );
	} );

	it( 'should prompt to delete a single item from the detail view, even when multiple selected', function( done ) {
		var tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } />
		).instance();
		tree.setView( ModalViews.DETAIL );
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to permanently delete this item?' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, DUMMY_MEDIA[ 0 ] );
			done();
		} );
	} );

	it( 'should return to the list view after deleting the only item in detail view', function( done ) {
		var tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA.slice( 0, 1 ) } />
		).instance();
		tree.setView( ModalViews.DETAIL );
		tree.deleteMedia();

		process.nextTick( function() {
			expect( tree.state.activeView ).to.equal( ModalViews.LIST );
			done();
		} );
	} );

	it( 'should revert to an earlier media item when the last item is deleted from detail view', function( done ) {
		var tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } />
		).instance();
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
