/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';

/**
 * Module variables
 */
const MOCK_SITE = {
	capabilities: {
		publish_posts: true
	},
	options: {}
};

describe( 'EditorGroundControl', function() {
	let shallow, i18n, EditorGroundControl;

	useMockery();
	useFakeDom();

	before( function() {
		shallow = require( 'enzyme' ).shallow;
		i18n = require( 'i18n-calypso' );

		mockery.registerMock( 'components/card', EmptyComponent );
		mockery.registerMock( 'components/popover', EmptyComponent );
		mockery.registerMock( 'my-sites/site', EmptyComponent );
		mockery.registerMock( 'post-editor/edit-post-status', EmptyComponent );
		mockery.registerMock( 'post-editor/editor-status-label', EmptyComponent );
		mockery.registerMock( 'components/sticky-panel', EmptyComponent );
		mockery.registerMock( 'components/post-schedule', EmptyComponent );
		EditorGroundControl = require( '../' );

		EditorGroundControl.prototype.translate = i18n.translate;
		EditorGroundControl.prototype.moment = i18n.moment;
	} );

	after( function() {
		delete EditorGroundControl.prototype.translate;
		delete EditorGroundControl.prototype.moment;
	} );

	describe( '#getPreviewLabel()', function() {
		it( 'should return View if the site is a Jetpack site and the post is published', function() {
			var tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					site={ { jetpack: true } }
				/>
			).instance();

			expect( tree.getPreviewLabel() ).to.equal( 'View' );
		} );

		it( 'should return Preview if the post was not originally published', function() {
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

	describe( '#isSaveEnabled()', function() {
		it( 'should return false if form is saving', function() {
			var tree = shallow( <EditorGroundControl isSaving /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return false if saving is blocked', function() {
			var tree = shallow( <EditorGroundControl isSaveBlocked /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return false if post does not exist', function() {
			var tree = shallow( <EditorGroundControl isSaving={ false } hasContent isDirty /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return true if dirty and post has content and post is not published', function() {
			var tree = shallow( <EditorGroundControl isSaving={ false } post={ {} } hasContent isDirty /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.true;
		} );

		it( 'should return false if dirty, but post has no content', function() {
			var tree = shallow( <EditorGroundControl isSaving={ false } isDirty /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );

		it( 'should return false if dirty and post is published', function() {
			var tree = shallow( <EditorGroundControl isSaving={ false } post={ { status: 'publish' } } isDirty /> ).instance();

			expect( tree.isSaveEnabled() ).to.be.false;
		} );
	} );

	describe( '#isPreviewEnabled()', function() {
		it( 'should return true if post is not empty', function() {
			var tree = shallow( <EditorGroundControl post={ {} } isNew hasContent isDirty /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		it( 'should return false if saving is blocked', function() {
			var tree = shallow( <EditorGroundControl isSaveBlocked /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		it( 'should return true even if form is publishing', function() {
			var tree = shallow( <EditorGroundControl post={ {} } hasContent isPublishing /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.true;
		} );

		it( 'should return false if not dirty', function() {
			var tree = shallow( <EditorGroundControl post={ {} } isDirty={ false } isNew /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );

		it( 'should return false if post has no content', function() {
			var tree = shallow( <EditorGroundControl post={ {} } hasContent={ false } /> ).instance();

			expect( tree.isPreviewEnabled() ).to.be.false;
		} );
	} );
} );
