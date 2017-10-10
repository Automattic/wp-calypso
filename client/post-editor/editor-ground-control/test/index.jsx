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
jest.mock( 'lib/user', () => () => {} );
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
		test( 'should return View if the site is a Jetpack site and the post is published', () => {
			var tree = shallow(
				<EditorGroundControl savedPost={ { status: 'publish' } } site={ { jetpack: true } } />
			).instance();

			expect( tree.getPreviewLabel() ).to.equal( 'View' );
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

	describe( '#isSaveEnabled()', () => {
		test( 'should return false if form is saving', () => {
			var tree = shallow( <EditorGroundControl isSaving /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		test( 'should return false if saving is blocked', () => {
			var tree = shallow( <EditorGroundControl isSaveBlocked /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		test( 'should return false if post does not exist', () => {
			var tree = shallow(
				<EditorGroundControl isSaving={ false } hasContent isDirty />
			).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		test( 'should return true if dirty and post has content and post is not published', () => {
			var tree = shallow(
				<EditorGroundControl isSaving={ false } post={ {} } hasContent isDirty />
			).instance();

			expect( tree.isSaveEnabled() ).to.be.true;
		} );

		test( 'should return false if dirty, but post has no content', () => {
			var tree = shallow( <EditorGroundControl isSaving={ false } isDirty /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		test( 'should return false if dirty and post is published', () => {
			var tree = shallow(
				<EditorGroundControl isSaving={ false } post={ { status: 'publish' } } isDirty />
			).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
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
