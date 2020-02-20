/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { EditorGroundControl } from '../';
import { isSaveAvailableFn } from '../quick-save-buttons';

jest.mock( 'blocks/site', () => require( 'components/empty-component' ) );
jest.mock( 'components/post-schedule', () => require( 'components/empty-component' ) );
jest.mock( 'components/sticky-panel', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/edit-post-status', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-status-label', () => require( 'components/empty-component' ) );

describe( 'EditorGroundControl', () => {
	describe( '#isPreviewEnabled()', () => {
		test( 'should return true if post is not empty', () => {
			const tree = shallow(
				<EditorGroundControl post={ {} } isNew hasContent isDirty />
			).instance();

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		test( 'should return false if saving is blocked', () => {
			const tree = shallow( <EditorGroundControl isSaveBlocked /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		test( 'should return true even if form is publishing', () => {
			const tree = shallow(
				<EditorGroundControl post={ {} } hasContent isPublishing />
			).instance();

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		test( 'should return false if not dirty', () => {
			const tree = shallow(
				<EditorGroundControl post={ {} } isDirty={ false } isNew />
			).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		test( 'should return false if post has no content', () => {
			const tree = shallow( <EditorGroundControl post={ {} } hasContent={ false } /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );
	} );
} );

describe( 'QuickSaveButtons', () => {
	describe( '#isSaveAvailableFn()', () => {
		test( 'should return false if form is saving', () => {
			expect( isSaveAvailableFn( { isSaving: true } ) ).to.be.false;
		} );

		test( 'should return false if saving is blocked', () => {
			expect( isSaveAvailableFn( { isSaveBlocked: true } ) ).to.be.false;
		} );

		test( 'should return false if post does not exist', () => {
			expect( isSaveAvailableFn( { isSaving: false, hasContent: true, isDirty: true } ) ).to.be
				.false;
		} );

		test( 'should return true if dirty and post has content and post is not published', () => {
			expect( isSaveAvailableFn( { isSaving: false, post: {}, hasContent: true, isDirty: true } ) )
				.to.be.true;
		} );

		test( 'should return false if dirty, but post has no content', () => {
			expect( isSaveAvailableFn( { isSaving: false, isDirty: true } ) ).to.be.false;
		} );

		test( 'should return false if dirty and post is published', () => {
			expect( isSaveAvailableFn( { isSaving: false, post: { status: 'publish' }, isDirty: true } ) )
				.to.be.false;
		} );
	} );
} );
