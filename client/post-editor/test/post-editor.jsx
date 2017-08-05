/** @jest-environment jsdom */
jest.mock( 'components/tinymce', () => require( 'components/empty-component' ) );
jest.mock( 'components/popover', () => require( 'components/empty-component' ) );
jest.mock( 'components/forms/clipboard-button', () => require( 'components/empty-component' ) );
jest.mock( 'components/notice/notice-action', () => require( 'components/empty-component' ) );
jest.mock( 'components/notice', () => require( 'components/empty-component' ) );
jest.mock( 'components/segmented-control', () => require( 'components/empty-component' ) );
jest.mock( 'components/segmented-control/item', () => require( 'components/empty-component' ) );
jest.mock( 'lib/preferences/actions', () => ( {
	set() {}
} ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => {}
} ) );
jest.mock( 'matches-selector', () => require( 'component-matches-selector' ), { virtual: true } );
jest.mock( 'post-editor/editor-document-head', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-action-bar', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-drawer', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-featured-image', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-ground-control', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-title', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-page-slug', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-media-advanced', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-author', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-visibility', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-word-count', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-preview', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/invalid-url-dialog', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/restore-post-dialog', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-sidebar', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-status-label', () => require( 'components/empty-component' ) );
jest.mock( 'query', () => require( 'component-query' ), { virtual: true } );
jest.mock( 'tinymce/tinymce', () => require( 'components/empty-component' ) );
// TODO: REDUX - add proper tests when whole post-editor is reduxified
jest.mock( 'react-redux', () => ( {
	connect: () => component => component
} ) );

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { renderIntoDocument } from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import { PostEditor } from '../post-editor';
import PostEditStore from 'lib/posts/post-edit-store';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'PostEditor', function() {
	let sandbox;
	const defaultProps = {
		translate: string => string,
		markSaved: () => {},
		markChanged: () => {},
		setLayoutFocus: () => {}
	};

	useSandbox( ( newSandbox ) => sandbox = newSandbox );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( 'onEditedPostChange', function() {
		it( 'should clear content when store state transitions to isNew()', function() {
			const tree = renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );

			tree.editor = { setEditorContent: sandbox.spy() };
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		it( 'should not clear content when store state already isNew()', function() {
			const tree = renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.setState( { isNew: true } );
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );

		it( 'should clear content when loading', function() {
			const tree = renderIntoDocument(
				<PostEditor
					preferences={ {} }
					{ ...defaultProps }
				/>
			);

			const stub = sandbox.stub( PostEditStore, 'isLoading' );
			stub.returns( true );
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		it( 'should set content after load', function() {
			const tree = renderIntoDocument(
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
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.setState( { isLoading: true } );
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( content );
		} );

		it( 'a normal content change should not clear content', function() {
			const tree = renderIntoDocument(
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
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.setState( { post: { content: 'old content' } } );
			tree.onEditedPostChange();

			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );

		it( 'is a copy and it should set the copied content', function() {
			const tree = renderIntoDocument(
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

			tree.editor = { setEditorContent: sandbox.spy() };
			tree.onEditedPostChange();

			expect( tree.editor.setEditorContent ).to.have.been.calledWith( content );
		} );

		it( 'should not set the copied content more than once', function() {
			const tree = renderIntoDocument(
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

			tree.editor = { setEditorContent: sandbox.spy() };
			tree.onEditedPostChange();

			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );
	} );
} );
