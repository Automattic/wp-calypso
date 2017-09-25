/**
 * External dependencies
 */
import { identity, noop } from 'lodash';
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
import { ModalViews } from 'state/ui/media-modal/constants';

/**
 * Module variables
 */
const DUMMY_SITE = { ID: 1 };
const DUMMY_MEDIA = [
	{ ID: 100, date: '2015-06-19T11:36:09-04:00', mime_type: 'image/jpeg' },
	{ ID: 200, date: '2015-06-19T09:36:09-04:00', mime_type: 'image/jpeg' }
];
const DUMMY_VIDEO_MEDIA = [ { ID: 100, date: '2015-06-19T11:36:09-04:00', mime_type: 'video/mp4' } ];
const EMPTY_COMPONENT = React.createClass( {
	render: function() {
		return <div />;
	}
} );

describe( 'EditorMediaModal', function() {
	let spy, translate, deleteMedia, accept, EditorMediaModal, setLibrarySelectedItems, onClose;

	translate = require( 'i18n-calypso' ).translate;

	useMockery( () => {
		mockery.registerSubstitute( 'event', 'component-event' );
	} );
	useFakeDom();
	useSandbox( ( sandbox ) => {
		spy = sandbox.spy();
		setLibrarySelectedItems = sandbox.stub();
		deleteMedia = sandbox.stub();
		onClose = sandbox.stub();
		accept = sandbox.stub().callsArgWithAsync( 1, true );
	} );

	before( function() {
		// Mockery
		mockery.registerMock( 'my-sites/media-library', EMPTY_COMPONENT );
		mockery.registerMock( './detail', { 'default': EMPTY_COMPONENT } );
		mockery.registerMock( './gallery', EMPTY_COMPONENT );
		mockery.registerMock( './markup', { get: identity } );
		mockery.registerMock( './secondary-actions', EMPTY_COMPONENT );
		mockery.registerMock( 'components/dialog', EMPTY_COMPONENT );
		mockery.registerMock( 'components/popover', EMPTY_COMPONENT );
		mockery.registerMock( 'lib/accept', accept );
		mockery.registerMock( 'lib/analytics', { mc: { bumpStat: noop } } );
		mockery.registerMock( 'component-closest', {} );
		mockery.registerMock( 'lib/media/actions', { 'delete': deleteMedia, setLibrarySelectedItems: setLibrarySelectedItems } );
		mockery.registerMock( 'lib/posts/actions', { blockSave: noop } );
		mockery.registerMock( 'lib/posts/stats', {
			recordEvent: noop,
			recordState: noop
		} );

		EditorMediaModal = require( '../' ).EditorMediaModal;
	} );

	it( 'should prompt to delete a single item from the list view', function( done ) {
		let media = DUMMY_MEDIA.slice( 0, 1 ),
			tree;

		tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ media } translate={ translate } />
		).instance();
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to delete this item? ' +
			'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
			'This cannot be undone.' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, media );
			done();
		} );
	} );

	it( 'should prompt to delete multiple items from the list view', function( done ) {
		const tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } translate={ translate } />
		).instance();
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to delete these items? ' +
			'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
			'This cannot be undone.' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, DUMMY_MEDIA );
			done();
		} );
	} );

	it( 'should prompt to delete a single item from the detail view', function( done ) {
		let media = DUMMY_MEDIA[ 0 ],
			tree;

		tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ [ media ] } view={ ModalViews.DETAIL } />
		).instance();
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to delete this item? ' +
			'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
			'This cannot be undone.' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, media );
			done();
		} );
	} );

	it( 'should prompt to delete a single item from the detail view, even when multiple selected', function( done ) {
		const tree = shallow(
			<EditorMediaModal site={ DUMMY_SITE } mediaLibrarySelectedItems={ DUMMY_MEDIA } view={ ModalViews.DETAIL } />
		).instance();
		tree.deleteMedia();

		expect( accept ).to.have.been.calledWith( 'Are you sure you want to delete this item? ' +
			'Deleted media will no longer appear anywhere on your website, including all posts, pages, and widgets. ' +
			'This cannot be undone.' );
		process.nextTick( function() {
			expect( deleteMedia ).to.have.been.calledWith( DUMMY_SITE.ID, DUMMY_MEDIA[ 0 ] );
			done();
		} );
	} );

	it( 'should return to the list view after deleting the only item in detail view', function( done ) {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				mediaLibrarySelectedItems={ DUMMY_MEDIA.slice( 0, 1 ) }
				view={ ModalViews.DETAIL }
				setView={ spy } />
		).instance();

		tree.deleteMedia();

		process.nextTick( function() {
			expect( spy ).to.have.been.calledWith( ModalViews.LIST );
			done();
		} );
	} );

	it( 'should revert to an earlier media item when the last item is deleted from detail view', function( done ) {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				mediaLibrarySelectedItems={ DUMMY_MEDIA }
				view={ ModalViews.DETAIL }
				setView={ spy } />
		).instance();
		tree.setDetailSelectedIndex( 1 );
		tree.deleteMedia();

		process.nextTick( function() {
			expect( spy ).to.not.have.been.called;
			expect( tree.state.detailSelectedIndex ).to.equal( 0 );
			done();
		} );
	} );

	it( 'should show no buttons if editing an image', () => {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				mediaLibrarySelectedItems={ [] }
				view={ ModalViews.IMAGE_EDITOR }
				setView={ spy } />
		).instance();

		const buttons = tree.getModalButtons();

		expect( buttons ).to.be.undefined;
	} );

	it( 'should show an insert button when viewing external media (no selection)', () => {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				view={ ModalViews.DETAIL }
				setView={ spy } />
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).to.be.equals( 2 );
		expect( buttons[ 1 ].label ).to.be.equals( 'Insert' );
	} );

	it( 'should show a insert button when 1 external image is selected', () => {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				view={ ModalViews.DETAIL }
				mediaLibrarySelectedItems={ DUMMY_MEDIA.slice( 0, 1 ) }
				setView={ spy } />
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).to.be.equals( 2 );
		expect( buttons[ 1 ].label ).to.be.equals( 'Insert' );
	} );

	it( 'should show a copy button when 1 external video is selected', () => {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				view={ ModalViews.DETAIL }
				mediaLibrarySelectedItems={ DUMMY_VIDEO_MEDIA }
				setView={ spy } />
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).to.be.equals( 2 );
		expect( buttons[ 1 ].label ).to.be.equals( 'Copy to media library' );
	} );

	it( 'should show a copy button when 2 or more external media are selected', () => {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				view={ ModalViews.DETAIL }
				mediaLibrarySelectedItems={ DUMMY_MEDIA }
				setView={ spy } />
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).to.be.equals( 2 );
		expect( buttons[ 1 ].label ).to.be.equals( 'Copy to media library' );
	} );

	it( 'should show a continue button when multiple images are selected', () => {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				mediaLibrarySelectedItems={ DUMMY_MEDIA }
				view={ ModalViews.DETAIL }
				setView={ spy } />
		).instance();

		const buttons = tree.getModalButtons();

		expect( buttons[ 1 ].label ).to.be.equals( 'Continue' );
	} );

	it( 'should show an insert button if none or one local items are selected', () => {
		const tree = shallow(
			<EditorMediaModal
				site={ DUMMY_SITE }
				view={ ModalViews.DETAIL }
				setView={ spy } />
		).instance();

		const buttons = tree.getModalButtons();

		expect( buttons[ 1 ].label ).to.be.equals( 'Insert' );
	} );

	describe( '#confirmSelection()', () => {
		it( 'should close modal if viewing local media and button is pressed', done => {
			const tree = shallow(
				<EditorMediaModal
					site={ DUMMY_SITE }
					mediaLibrarySelectedItems={ DUMMY_MEDIA }
					onClose={ onClose }
					view={ ModalViews.DETAIL }
					setView={ spy } />
			).instance();

			tree.confirmSelection();

			process.nextTick( () => {
				expect( onClose ).to.have.been.calledWith( {
					items: DUMMY_MEDIA,
					settings: undefined,
					type: 'media',
				} );

				done();
			} );
		} );

		it( 'should copy external media after loading WordPress library if 2 or more media are selected and button is pressed', done => {
			const tree = shallow(
				<EditorMediaModal
					site={ DUMMY_SITE }
					mediaLibrarySelectedItems={ DUMMY_MEDIA }
					view={ ModalViews.DETAIL }
					setView={ spy } />
			).instance();

			tree.setState( { source: 'external' } );
			tree.copyExternalAfterLoadingWordPressLibrary = onClose;
			tree.confirmSelection();

			// EditorMediaModal will generate transient ID for the media selected
			// by using uniqueId, which increments its value within the same session.
			const transientItems = [
				Object.assign( {}, DUMMY_MEDIA[ 0 ], { ID: 'media-1', 'transient': true } ),
				Object.assign( {}, DUMMY_MEDIA[ 1 ], { ID: 'media-2', 'transient': true } )
			];
			process.nextTick( () => {
				expect( onClose ).to.have.been.calledWith( transientItems, 'external' );
				done();
			} );
		} );

		it( 'should copy external media and insert it in the editor if 1 image is selected and button is pressed', done => {
			const SINGLE_ITEM_MEDIA = DUMMY_MEDIA.slice( 0, 1 );
			const tree = shallow(
				<EditorMediaModal
					site={ DUMMY_SITE }
					mediaLibrarySelectedItems={ SINGLE_ITEM_MEDIA }
					view={ ModalViews.DETAIL }
					setView={ spy } />
			).instance();

			tree.setState( { source: 'external' } );
			tree.copyExternal = onClose;
			tree.confirmSelection();

			// EditorMediaModal will generate transient ID for the media selected
			// by using uniqueId, which increments its value within the same session.
			const transientItems = [
				Object.assign( {}, SINGLE_ITEM_MEDIA[ 0 ], { ID: 'media-3', 'transient': true } )
			];
			process.nextTick( () => {
				expect( onClose ).to.have.been.calledWith( transientItems, 'external' );
				done();
			} );
		} );

		it( 'should copy external after loading WordPress library if 1 video is selected and button is pressed', done => {
			const tree = shallow(
				<EditorMediaModal
					site={ DUMMY_SITE }
					mediaLibrarySelectedItems={ DUMMY_VIDEO_MEDIA }
					view={ ModalViews.DETAIL }
					setView={ spy } />
			).instance();

			tree.setState( { source: 'external' } );
			tree.copyExternalAfterLoadingWordPressLibrary = onClose;
			tree.confirmSelection();

			// EditorMediaModal will generate transient ID for the media selected
			// by using uniqueId, which increments its value within the same session.
			const transientItems = [
				Object.assign( {}, DUMMY_VIDEO_MEDIA[ 0 ], { ID: 'media-4', 'transient': true } )
			];
			process.nextTick( () => {
				expect( onClose ).to.have.been.calledWith( transientItems, 'external' );
				done();
			} );
		} );
	} );
} );
