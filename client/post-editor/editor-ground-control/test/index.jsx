/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';
import React from 'react';
import sinon from 'sinon';
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

const MOCK_USER = {
	email_verified: true
};

const MOCK_USER_UTILS = {
	needsVerificationForSite: function ( site ) { return !MOCK_USER.email_verified; }
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
		mockery.registerMock( 'blocks/site', EmptyComponent );
		mockery.registerMock( 'post-editor/edit-post-status', EmptyComponent );
		mockery.registerMock( 'post-editor/editor-status-label', EmptyComponent );
		mockery.registerMock( 'components/sticky-panel', EmptyComponent );
		mockery.registerMock( 'components/post-schedule', EmptyComponent );
		mockery.registerMock( 'lib/user/utils', {
			needsVerificationForSite: () => !MOCK_USER.email_verified,
		} );
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

	describe( '#getPrimaryButtonLabel()', function() {
		it( 'should return Update if the post was originally published and is still slated to be published', function() {
			var tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					post={ { status: 'publish' } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Update if the post was originally published and is currently reverted to non-published status', function() {
			var tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					post={ { status: 'draft' } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Schedule if the post is dated in the future and not scheduled', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					post={ { date: nextMonth } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Schedule' );
		} );

		it( 'should return Schedule if the post is dated in the future and published', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					post={ { date: nextMonth } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Schedule' );
		} );

		it( 'should return Update if the post is scheduled and dated in the future', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'future', date: nextMonth } }
					post={ { title: 'change', status: 'future', date: nextMonth } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Update if the post is scheduled, dated in the future, and next status is draft', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'future', date: nextMonth } }
					post={ { title: 'change', status: 'draft', date: nextMonth } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Publish if the post is scheduled and dated in the past', function() {
			var now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'future', date: lastMonth } }
					post={ { title: 'change', status: 'future', date: lastMonth } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Publish' );
		} );

		it( 'should return Update if the post was originally published and is scheduled with date in the past', function() {
			var now = moment(),
				lastMonth = now.month( now.month() - 1 ).format(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'publish', date: lastMonth } }
					post={ { title: 'change', status: 'future', date: lastMonth } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Publish if the post is a draft', function() {
			var tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Publish' );
		} );

		it( 'should return "Submit for Review" if the post is a draft and user can\'t publish', function() {
			var tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					site={ {
						capabilities: {
							publish_posts: false
						}
					} }
				/>
			).instance();

			expect( tree.getPrimaryButtonLabel() ).to.equal( 'Submit for Review' );
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

	describe( '#isPrimaryButtonEnabled()', function() {
		it( 'should return true if form is not publishing and post is not empty', function() {
			var tree = shallow( <EditorGroundControl isPublishing={ false } post={ {} } hasContent isDirty isNew /> ).instance();

			expect( tree.isPrimaryButtonEnabled() ).to.be.true;
		} );

		it( 'should return false if form is not publishing and post is not empty, but user is not verified', function() {
			MOCK_USER.email_verified = false;
			let tree = shallow( <EditorGroundControl isPublishing={ false } post={ {} } user={ MOCK_USER } userUtils={ MOCK_USER_UTILS } hasContent isDirty isNew /> ).instance();

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
			MOCK_USER.email_verified = true;
		} );

		it( 'should return true if form is not publishind and post is new and has content, but is not dirty', function() {
			var tree = shallow( <EditorGroundControl isPublishing={ false } post={ {} } hasContent isDirty={ false } isNew /> ).instance();

			expect( tree.isPrimaryButtonEnabled() ).to.be.true;
		} );

		it( 'should return false if form is publishing', function() {
			var tree = shallow( <EditorGroundControl isPublishing /> ).instance();

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );

		it( 'should return false if saving is blocked', function() {
			var tree = shallow( <EditorGroundControl isSaveBlocked /> ).instance();

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );

		it( 'should return false if not dirty and has no content', function() {
			var tree = shallow( <EditorGroundControl post={ {} } isDirty={ false } hasContent={ false } isNew /> ).instance();

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );

		it( 'should return false if post has no content', function() {
			var tree = shallow( <EditorGroundControl post={ {} } hasContent={ false } /> ).instance();

			expect( tree.isPrimaryButtonEnabled() ).to.be.false;
		} );
	} );

	describe( '#onPrimaryButtonClick', function() {
		it( 'should publish a draft', function() {
			var onPublish = sinon.spy(),
				tree;

			tree = shallow(
				<EditorGroundControl
					post={ { status: 'draft' } }
					site={ MOCK_SITE }
					onPublish={ onPublish }
				/>
			).instance();

			tree.onPrimaryButtonClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should schedule a posted dated in future', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onSave = sinon.spy(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'draft', date: nextMonth } }
					post={ { title: 'change', status: 'draft', date: nextMonth } }
					onSave={ onSave }
					site={ MOCK_SITE }
				/>
			).instance();

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.calledWith( 'future' );
		} );

		it( 'should save a scheduled post dated in future', function() {
			var now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onSave = sinon.spy(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'future', date: nextMonth } }
					post={ { title: 'change', status: 'future', date: nextMonth } }
					onSave={ onSave }
					site={ MOCK_SITE }
				/>
			).instance();

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.calledWith( 'future' );
		} );

		it( 'should publish a scheduled post dated in past', function() {
			var now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				onPublish = sinon.spy(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'future', date: lastMonth } }
					post={ { title: 'change', status: 'future', date: lastMonth } }
					onPublish={ onPublish }
					site={ MOCK_SITE }
				/>
			).instance();

			tree.onPrimaryButtonClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should update a published post that has changed status', function() {
			var onSave = sinon.spy(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					post={ { title: 'change', status: 'draft' } }
					onSave={ onSave }
					site={ MOCK_SITE }
				/>
			).instance();

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.called;
		} );

		it( 'should update a published post scheduled in the past', function() {
			var now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				onSave = sinon.spy(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'publish' } }
					post={ { title: 'change', status: 'future', date: lastMonth } }
					onSave={ onSave }
					site={ MOCK_SITE }
				/>
			).instance();

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.called;
		} );

		it( 'should set status to "pending" if the user can\'t publish', function() {
			var onSave = sinon.spy(),
				tree;

			tree = shallow(
				<EditorGroundControl
					savedPost={ { status: 'draft' } }
					onSave={ onSave }
					site={ {
						capabilities: {
							publish_posts: false
						}
					} }
				/>
			).instance();

			tree.onPrimaryButtonClick();

			expect( onSave ).to.have.been.calledWith( 'pending' );
		} );
	} );
} );
