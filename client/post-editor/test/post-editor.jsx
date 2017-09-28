/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import mockery from 'mockery';
import { expect } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';

describe.skip( 'PostEditor', function() {
	let sandbox, TestUtils, PostEditor, PostEditStore;
	const defaultProps = {
		translate: string => string,
		markSaved: () => {},
		markChanged: () => {},
		setLayoutFocus: () => {}
	};

	useSandbox( ( newSandbox ) => sandbox = newSandbox );
	useMockery();

	before( () => {
		TestUtils = require( 'react-addons-test-utils' );

		const MOCK_COMPONENT = React.createClass( {
			render: function() {
				return null;
			}
		} );

		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );
		mockery.registerMock( 'components/tinymce', MOCK_COMPONENT );
		mockery.registerMock( 'components/popover', MOCK_COMPONENT );
		mockery.registerMock( 'components/forms/clipboard-button', MOCK_COMPONENT );
		mockery.registerMock( 'components/notice/notice-action', MOCK_COMPONENT );
		mockery.registerMock( 'components/notice', MOCK_COMPONENT );
		mockery.registerMock( 'components/segmented-control', MOCK_COMPONENT );
		mockery.registerMock( 'components/segmented-control/item', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-document-head', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-action-bar', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-drawer', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-featured-image', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-ground-control', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-title', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-page-slug', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-media-advanced', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-mobile-navigation', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-author', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-visibility', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-word-count', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-preview', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/invalid-url-dialog', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/restore-post-dialog', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-sidebar', MOCK_COMPONENT );
		mockery.registerMock( 'post-editor/editor-status-label', MOCK_COMPONENT );
		mockery.registerMock( 'tinymce/tinymce', MOCK_COMPONENT );
		mockery.registerMock( './editor-preview', MOCK_COMPONENT );
		mockery.registerMock( 'lib/preferences/actions', { set() {} } );
		mockery.registerMock( 'lib/wp', {
			me: () => ( {
				get: noop
			} ),
			undocumented: noop
		} );
		// TODO: REDUX - add proper tests when whole post-editor is reduxified
		mockery.registerMock( 'react-redux', {
			connect: () => ( component ) => component
		} );

		PostEditStore = require( 'lib/posts/post-edit-store' );
		PostEditor = require( '../post-editor' ).PostEditor;
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( 'onEditedPostChange', function() {
		it( 'should clear content when store state transitions to isNew()', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );

			tree.editor.setEditorContent = sandbox.spy();
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		it( 'should not clear content when store state already isNew()', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );
			tree.editor.setEditorContent = sandbox.spy();
			tree.setState( { isNew: true } );
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );

		it( 'should clear content when loading', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isLoading' );
			stub.returns( true );
			tree.editor.setEditorContent = sandbox.spy();
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		it( 'should set content after load', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const content = 'loaded post';
			const stub = sandbox.stub( PostEditStore, 'get' );
			stub.returns( {
				content: content
			} );
			tree.editor.setEditorContent = sandbox.spy();
			tree.setState( { isLoading: true } );
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( content );
		} );

		it( 'a normal content change should not clear content', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const content = 'new content';
			const stub = sandbox.stub( PostEditStore, 'get' );
			stub.returns( {
				content: content
			} );
			tree.editor.setEditorContent = sandbox.spy();
			tree.setState( { post: { content: 'old content' } } );
			tree.onEditedPostChange();

			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );

		it( 'is a copy and it should set the copied content', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const content = 'copied content';
			tree.setState( {
				isNew: true,
				hasContent: true,
				isDirty: false,
			} );

			sandbox.stub( PostEditStore, 'get' ).returns( { content: content } );

			tree.editor.setEditorContent = sandbox.spy();
			tree.onEditedPostChange();

			expect( tree.editor.setEditorContent ).to.have.been.calledWith( content );
		} );

		it( 'should not set the copied content more than once', function() {
			const tree = TestUtils.renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const content = 'copied content';
			tree.setState( {
				isNew: true,
				hasContent: true,
				isDirty: true,
			} );

			sandbox.stub( PostEditStore, 'get' ).returns( { content: content } );

			tree.editor.setEditorContent = sandbox.spy();
			tree.onEditedPostChange();

			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );
	} );
} );
