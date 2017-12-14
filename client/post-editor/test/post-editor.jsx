/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { expect } from 'chai';
import React from 'react';
import { renderIntoDocument } from 'react-dom/test-utils';

/**
 * Internal dependencies
 */
import { PostEditor } from '../post-editor';
import PostEditStore from 'lib/posts/post-edit-store';
import { useSandbox } from 'test/helpers/use-sinon';

jest.mock( 'components/tinymce', () => require( 'components/empty-component' ) );
jest.mock( 'components/popover', () => require( 'components/empty-component' ) );
jest.mock( 'components/forms/clipboard-button', () => require( 'components/empty-component' ) );
jest.mock( 'components/notice/notice-action', () => require( 'components/empty-component' ) );
jest.mock( 'components/notice', () => require( 'components/empty-component' ) );
jest.mock( 'components/segmented-control', () => require( 'components/empty-component' ) );
jest.mock( 'components/segmented-control/item', () => require( 'components/empty-component' ) );
jest.mock( 'lib/preferences/actions', () => ( {
	set() {},
} ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'lib/wp', () => ( {
	undocumented: () => {},
} ) );
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
jest.mock( 'post-editor/editor-revisions/dialog', () => require( 'components/empty-component' ) );
jest.mock( 'query', () => require( 'component-query' ), { virtual: true } );
jest.mock( 'tinymce/tinymce', () => require( 'components/empty-component' ) );
// TODO: REDUX - add proper tests when whole post-editor is reduxified
jest.mock( 'react-redux', () => ( {
	connect: () => component => component,
} ) );

describe( 'PostEditor', () => {
	let sandbox;
	const defaultProps = {
		translate: string => string,
		markSaved: () => {},
		markChanged: () => {},
		setLayoutFocus: () => {},
		setNextLayoutFocus: () => {},
		setNestedSidebar: () => {},
		preferences: {},
	};

	useSandbox( newSandbox => ( sandbox = newSandbox ) );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'onEditedPostChange', () => {
		test( 'should clear content when store state transitions to isNew()', () => {
			const tree = renderIntoDocument( <PostEditor { ...defaultProps } /> );

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );

			tree.editor = { setEditorContent: sandbox.spy() };
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		test( 'should not clear content when store state already isNew()', () => {
			const tree = renderIntoDocument( <PostEditor { ...defaultProps } /> );

			const stub = sandbox.stub( PostEditStore, 'isNew' );
			stub.returns( true );
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.setState( { isNew: true } );
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );

		test( 'should clear content when loading', () => {
			const tree = renderIntoDocument( <PostEditor { ...defaultProps } /> );

			const stub = sandbox.stub( PostEditStore, 'isLoading' );
			stub.returns( true );
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( '' );
		} );

		test( 'should set content after load', () => {
			const tree = renderIntoDocument( <PostEditor { ...defaultProps } /> );

			const content = 'loaded post';
			const stub = sandbox.stub( PostEditStore, 'get' );
			stub.returns( {
				content: content,
			} );
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.setState( { isLoading: true } );
			tree.onEditedPostChange();
			expect( tree.editor.setEditorContent ).to.have.been.calledWith( content );
		} );

		test( 'a normal content change should not clear content', () => {
			const tree = renderIntoDocument( <PostEditor { ...defaultProps } /> );

			const content = 'new content';
			const stub = sandbox.stub( PostEditStore, 'get' );
			stub.returns( {
				content: content,
			} );
			tree.editor = { setEditorContent: sandbox.spy() };
			tree.setState( { post: { content: 'old content' } } );
			tree.onEditedPostChange();

			expect( tree.editor.setEditorContent ).to.not.have.been.called;
		} );

		test( 'is a copy and it should set the copied content', () => {
			const tree = renderIntoDocument( <PostEditor { ...defaultProps } /> );

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

		test( 'should not set the copied content more than once', () => {
			const tree = renderIntoDocument( <PostEditor { ...defaultProps } /> );

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

	describe( '#onEditorContentChange()', () => {
		test( 'triggers a pending raw content and autosave, canceled on save', () => {
			const wrapper = shallow( <PostEditor { ...defaultProps } /> );

			wrapper.instance().debouncedAutosave = sandbox.stub();
			wrapper.instance().debouncedAutosave.cancel = sandbox.stub();
			wrapper.instance().throttledAutosave = sandbox.stub();
			wrapper.instance().throttledAutosave.cancel = sandbox.stub();
			wrapper.instance().debouncedSaveRawContent = sandbox.stub();

			wrapper.instance().onEditorContentChange();

			expect( wrapper.instance().debouncedAutosave ).to.have.been.called;
			expect( wrapper.instance().debouncedSaveRawContent ).to.have.been.called;

			wrapper.setState( { isSaving: true } );

			expect( wrapper.instance().debouncedAutosave.cancel ).to.have.been.called;
			expect( wrapper.instance().throttledAutosave.cancel ).to.have.been.called;
		} );
	} );
} );
