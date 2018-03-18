/**
 * @format
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
jest.mock( 'components/card', () => require( 'components/empty-component' ) );
jest.mock( 'components/popover', () => require( 'components/empty-component' ) );
jest.mock( 'components/post-schedule', () => require( 'components/empty-component' ) );
jest.mock( 'components/sticky-panel', () => require( 'components/empty-component' ) );
jest.mock( 'lib/posts/actions', () => ( {
	edit: () => {},
} ) );
jest.mock( 'lib/posts/actions', () => ( {
	recordEvent: () => {},
	recordStat: () => {},
} ) );
jest.mock( 'post-editor/edit-post-status', () => require( 'components/empty-component' ) );
jest.mock( 'post-editor/editor-status-label', () => require( 'components/empty-component' ) );

/**
 * Module variables
 */
const MOCK_SITE = {
	capabilities: {
		publish_posts: true,
	},
	options: {},
};

describe( 'EditorGroundControl', () => {
	describe( '#getPreviewLabel()', () => {
		test( 'should return Preview if the site is a Jetpack site and the post is published', () => {
			// getPreviewLabel should always return "Preview" since it's the label for the Preview button
			// (as opposed to directly visiting your site outside of Calypso)
			// previously, this test checked for two different possible labels
			// now leaving this here to ensure that it returns "Preview" in different situations
			var tree = shallow(
				<EditorGroundControl savedPost={ { status: 'publish' } } site={ { jetpack: true } } />
			).instance();

			expect( tree.getPreviewLabel() ).to.equal( 'Preview' );
		} );

		test( 'should return Preview if the post was not originally published', () => {
			var tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					post={ { status: 'publish' } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPreviewLabel() ).to.equal( 'Preview' );
		} );
	} );

	describe( '#isPreviewEnabled()', () => {
		test( 'should return true if post is not empty', () => {
			var tree = shallow( <EditorGroundControl post={ {} } isNew hasContent isDirty /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		test( 'should return false if saving is blocked', () => {
			var tree = shallow( <EditorGroundControl isSaveBlocked /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		test( 'should return true even if form is publishing', () => {
			var tree = shallow( <EditorGroundControl post={ {} } hasContent isPublishing /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		test( 'should return false if not dirty', () => {
			var tree = shallow( <EditorGroundControl post={ {} } isDirty={ false } isNew /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		test( 'should return false if post has no content', () => {
			var tree = shallow( <EditorGroundControl post={ {} } hasContent={ false } /> ).instance();

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
