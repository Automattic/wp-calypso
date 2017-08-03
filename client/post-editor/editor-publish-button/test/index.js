/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';
import React from 'react';
import sinon from 'sinon';
import mockery from 'mockery';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
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

describe( 'EditorPublishButton', function() {
	let EditorPublishButton;

	useMockery();
	useFakeDom();

	before( function() {
		mockery.registerMock( 'lib/posts/stats', {
			recordEvent: noop
		} );
		EditorPublishButton = require( '../' ).EditorPublishButton;
	} );

	describe( '#getButtonLabel()', function() {
		it( 'should return Update if the post was originally published and is still slated to be published', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					savedPost={ { status: 'publish' } }
					post={ { status: 'publish' } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Update if the post was originally published and is currently reverted to non-published status', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					savedPost={ { status: 'publish' } }
					post={ { status: 'draft' } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Schedule if the post is dated in the future and not scheduled', function() {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'draft' } }
						post={ { date: nextMonth } }
						site={ MOCK_SITE }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Schedule' );
		} );

		it( 'should return Schedule if the post is dated in the future and published', function() {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'publish' } }
						post={ { date: nextMonth } }
						site={ MOCK_SITE }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Schedule' );
		} );

		it( 'should return Update if the post is scheduled and dated in the future', function() {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'future', date: nextMonth } }
						post={ { title: 'change', status: 'future', date: nextMonth } }
						site={ MOCK_SITE }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Update if the post is scheduled, dated in the future, and next status is draft', function() {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'future', date: nextMonth } }
						post={ { title: 'change', status: 'draft', date: nextMonth } }
						site={ MOCK_SITE }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		it( 'should return Publish if the post is scheduled and dated in the past', function() {
			const now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'future', date: lastMonth } }
						post={ { title: 'change', status: 'future', date: lastMonth } }
						site={ MOCK_SITE }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Publish' );
		} );

		it( 'should return Publish if the post is a draft', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					savedPost={ { status: 'draft' } }
					site={ MOCK_SITE }
				/>
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Publish' );
		} );

		it( 'should return "Submit for Review" if the post is a draft and user can\'t publish', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					savedPost={ { status: 'draft' } }
					site={ {
						capabilities: {
							publish_posts: false
						}
					} }
				/>
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Submit for Review' );
		} );
	} );

	describe( '#isEnabled()', function() {
		it( 'should return true if form is not publishing and post is not empty', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					isPublishing={ false }
					post={ {} }
					hasContent
					isDirty
					isNew
				/> ).instance();

			expect( tree.isEnabled() ).to.be.true;
		} );

		it( 'should return false if form is not publishing and post is not empty, but user is not verified', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					isPublishing={ false }
					post={ {} }
					needsVerification={ true }
					hasContent
					isDirty
					isNew
				/> ).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		it( 'should return true if form is not published and post is new and has content, but is not dirty', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					isPublishing={ false }
					post={ {} }
					hasContent
					isDirty={ false }
					isNew
				/> ).instance();

			expect( tree.isEnabled() ).to.be.true;
		} );

		it( 'should return false if form is publishing', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					isPublishing
				/> ).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		it( 'should return false if saving is blocked', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					isSaveBlocked
				/> ).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		it( 'should return false if not dirty and has no content', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					post={ {} }
					isDirty={ false }
					hasContent={ false }
					isNew
				/> ).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		it( 'should return false if post has no content', function() {
			const tree = shallow(
				<EditorPublishButton translate={ identity }
					post={ {} }
					hasContent={ false }
				/> ).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );
	} );

	describe( '#onClick', function() {
		it( 'should publish a draft', function() {
			const onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						post={ { status: 'draft' } }
						site={ MOCK_SITE }
						onPublish={ onPublish }
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should schedule a posted dated in future', function() {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'draft', date: nextMonth } }
						post={ { title: 'change', status: 'draft', date: nextMonth } }
						onPublish={ onPublish }
						site={ MOCK_SITE }
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should save a scheduled post dated in future', function() {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'future', date: nextMonth } }
						post={ { title: 'change', status: 'future', date: nextMonth } }
						onPublish={ onPublish }
						site={ MOCK_SITE }
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should publish a scheduled post dated in past', function() {
			const now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'future', date: lastMonth } }
						post={ { title: 'change', status: 'future', date: lastMonth } }
						onPublish={ onPublish }
						site={ MOCK_SITE }
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		it( 'should update a published post that has changed status', function() {
			const onSave = sinon.spy(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'publish' } }
						post={ { title: 'change', status: 'draft' } }
						onSave={ onSave }
						site={ MOCK_SITE }
					/>
				).instance();

			tree.onClick();

			expect( onSave ).to.have.been.called;
		} );

		it( 'should set status to "pending" if the user can\'t publish', function() {
			const onSave = sinon.spy(),
				tree = shallow(
					<EditorPublishButton translate={ identity }
						savedPost={ { status: 'draft' } }
						onSave={ onSave }
						site={ {
							capabilities: {
								publish_posts: false
							}
						} }
					/>
				).instance();

			tree.onClick();

			expect( onSave ).to.have.been.calledWith( 'pending' );
		} );
	} );
} );
