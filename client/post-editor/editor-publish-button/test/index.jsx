/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity } from 'lodash';
import moment from 'moment';
import React from 'react';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { EditorPublishButton } from '../';

jest.mock( 'lib/posts/stats', () => ( {
	recordEvent: () => {},
} ) );
jest.mock( 'lib/user', () => () => {} );

/**
 * Module variables
 */
const MOCK_SITE = {
	capabilities: {
		publish_posts: true,
	},
	options: {},
};

describe( 'EditorPublishButton', () => {
	describe( '#getButtonLabel()', () => {
		test( 'should return Update if the post was originally published and is still slated to be published', () => {
			const tree = shallow(
				<EditorPublishButton
					translate={ identity }
					savedPost={ { status: 'publish' } }
					post={ { status: 'publish' } }
				/>
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		test( 'should return Update if the post was originally published and is currently reverted to non-published status', () => {
			const tree = shallow(
				<EditorPublishButton
					translate={ identity }
					savedPost={ { status: 'publish' } }
					post={ { status: 'draft' } }
				/>
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		test( 'should return Schedule if the post is dated in the future and not scheduled', () => {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'draft' } }
						post={ { date: nextMonth } }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Schedule' );
		} );

		test( 'should return Schedule if the post is dated in the future and published', () => {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'publish' } }
						post={ { date: nextMonth } }
						site={ MOCK_SITE }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Schedule' );
		} );

		test( 'should return Update if the post is scheduled and dated in the future', () => {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'future', date: nextMonth } }
						post={ { title: 'change', status: 'future', date: nextMonth } }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		test( 'should return Update if the post is scheduled, dated in the future, and next status is draft', () => {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'future', date: nextMonth } }
						post={ { title: 'change', status: 'draft', date: nextMonth } }
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Update' );
		} );

		test( 'should return Publish if the post is scheduled and dated in the past', () => {
			const now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'future', date: lastMonth } }
						post={ { title: 'change', status: 'future', date: lastMonth } }
						canUserPublishPosts
					/>
				).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Publish' );
		} );

		test( 'should return Publish if the post is a draft', () => {
			const tree = shallow(
				<EditorPublishButton
					translate={ identity }
					savedPost={ { status: 'draft' } }
					canUserPublishPosts
				/>
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Publish' );
		} );

		test( 'should return "Submit for Review" if the post is a draft and user can\'t publish', () => {
			const tree = shallow(
				<EditorPublishButton translate={ identity } savedPost={ { status: 'draft' } } />
			).instance();

			expect( tree.getButtonLabel() ).to.equal( 'Submit for Review' );
		} );
	} );

	describe( '#isEnabled()', () => {
		test( 'should return true if form is not publishing and post is not empty', () => {
			const tree = shallow(
				<EditorPublishButton
					translate={ identity }
					isPublishing={ false }
					post={ {} }
					hasContent
					isDirty
					isNew
				/>
			).instance();

			expect( tree.isEnabled() ).to.be.true;
		} );

		test( 'should return false if form is not publishing and post is not empty, but user is not verified', () => {
			const tree = shallow(
				<EditorPublishButton
					translate={ identity }
					isPublishing={ false }
					post={ {} }
					needsVerification={ true }
					hasContent
					isDirty
					isNew
				/>
			).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		test( 'should return true if form is not published and post is new and has content, but is not dirty', () => {
			const tree = shallow(
				<EditorPublishButton
					translate={ identity }
					isPublishing={ false }
					post={ {} }
					hasContent
					isDirty={ false }
					isNew
				/>
			).instance();

			expect( tree.isEnabled() ).to.be.true;
		} );

		test( 'should return false if form is publishing', () => {
			const tree = shallow(
				<EditorPublishButton translate={ identity } isPublishing />
			).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		test( 'should return false if saving is blocked', () => {
			const tree = shallow(
				<EditorPublishButton translate={ identity } isSaveBlocked />
			).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		test( 'should return false if not dirty and has no content', () => {
			const tree = shallow(
				<EditorPublishButton
					translate={ identity }
					post={ {} }
					isDirty={ false }
					hasContent={ false }
					isNew
				/>
			).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );

		test( 'should return false if post has no content', () => {
			const tree = shallow(
				<EditorPublishButton translate={ identity } post={ {} } hasContent={ false } />
			).instance();

			expect( tree.isEnabled() ).to.be.false;
		} );
	} );

	describe( '#onClick', () => {
		test( 'should publish a draft', () => {
			const onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						post={ { status: 'draft' } }
						onPublish={ onPublish }
						canUserPublishPosts
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		test( 'should schedule a posted dated in future', () => {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'draft', date: nextMonth } }
						post={ { title: 'change', status: 'draft', date: nextMonth } }
						onPublish={ onPublish }
						site={ MOCK_SITE }
						canUserPublishPosts
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		test( 'should save a scheduled post dated in future', () => {
			const now = moment( new Date() ),
				nextMonth = now.month( now.month() + 1 ).format(),
				onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'future', date: nextMonth } }
						post={ { title: 'change', status: 'future', date: nextMonth } }
						onPublish={ onPublish }
						canUserPublishPosts
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		test( 'should publish a scheduled post dated in past', () => {
			const now = moment( new Date() ),
				lastMonth = now.month( now.month() - 1 ).format(),
				onPublish = sinon.spy(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'future', date: lastMonth } }
						post={ { title: 'change', status: 'future', date: lastMonth } }
						onPublish={ onPublish }
						canUserPublishPosts
					/>
				).instance();

			tree.onClick();

			expect( onPublish ).to.have.been.called;
		} );

		test( 'should update a published post that has changed status', () => {
			const onSave = sinon.spy(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'publish' } }
						post={ { title: 'change', status: 'draft' } }
						onSave={ onSave }
						site={ MOCK_SITE }
					/>
				).instance();

			tree.onClick();

			expect( onSave ).to.have.been.called;
		} );

		test( 'should set status to "pending" if the user can\'t publish', () => {
			const onSave = sinon.spy(),
				tree = shallow(
					<EditorPublishButton
						translate={ identity }
						savedPost={ { status: 'draft' } }
						onSave={ onSave }
					/>
				).instance();

			tree.onClick();

			expect( onSave ).to.have.been.calledWith( 'pending' );
		} );
	} );
} );
