/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import { EditorDiscussion } from '../';

jest.mock( 'components/info-popover', () => require( 'components/empty-component' ) );

/**
 * Module variables
 */
const DUMMY_SITE = {
	ID: 1,
	options: {
		default_comment_status: true,
		default_ping_status: false,
	},
};

describe( 'EditorDiscussion', function () {
	beforeEach( function () {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( '#getDiscussionSetting()', function () {
		test( 'should return an empty object if both post and site are unknown', function () {
			const tree = TestUtils.renderIntoDocument( <EditorDiscussion /> );

			expect( tree.getDiscussionSetting() ).to.eql( {} );
		} );

		test( 'should return the site default comments open if site exists and post is new', () => {
			const post = {
				type: 'post',
			};

			const tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ DUMMY_SITE } post={ post } isNew />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {
				comment_status: 'open',
				ping_status: 'closed',
			} );
		} );

		test( 'should return the site default pings open if site exists and post is new', () => {
			const site = {
					options: {
						default_comment_status: false,
						default_ping_status: true,
					},
				},
				post = {
					type: 'post',
				};

			const tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ site } post={ post } isNew />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {
				comment_status: 'closed',
				ping_status: 'open',
			} );
		} );

		test( 'should return comments closed if site exists, post is new, and post is type page', () => {
			const site = {
					options: {
						default_comment_status: false,
						default_ping_status: true,
					},
				},
				post = {
					type: 'page',
				};

			const tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ site } post={ post } isNew />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {
				comment_status: 'closed',
				ping_status: 'closed',
			} );
		} );

		test( 'should return the saved post values', () => {
			const post = {
				discussion: {
					comment_status: 'open',
					ping_status: 'closed',
				},
			};

			const tree = TestUtils.renderIntoDocument(
				<EditorDiscussion post={ post } site={ DUMMY_SITE } />
			);

			expect( tree.getDiscussionSetting() ).to.equal( post.discussion );
		} );
	} );

	describe( '#onChange', () => {
		const post = {
			discussion: {
				comment_status: 'closed',
				comments_open: false,
				ping_status: 'open',
				pings_open: true,
			},
		};

		test( 'should include modified comment status on the post object', () => {
			const editPost = sinon.spy();
			const tree = TestUtils.renderIntoDocument(
				<EditorDiscussion post={ post } site={ DUMMY_SITE } editPost={ editPost } />
			);
			const checkbox = ReactDom.findDOMNode( tree ).querySelector( '[name=ping_status]' );
			TestUtils.Simulate.change( checkbox, {
				target: {
					name: 'comment_status',
					checked: true,
				},
			} );

			expect( editPost ).to.have.been.calledWith( DUMMY_SITE.ID, null, {
				discussion: {
					comment_status: 'open',
					ping_status: 'open',
				},
			} );
		} );

		test( 'should include modified ping status on the post object', () => {
			const editPost = sinon.spy();
			const tree = TestUtils.renderIntoDocument(
				<EditorDiscussion post={ post } site={ DUMMY_SITE } editPost={ editPost } />
			);
			const checkbox = ReactDom.findDOMNode( tree ).querySelector( '[name=ping_status]' );
			TestUtils.Simulate.change( checkbox, {
				target: {
					name: 'ping_status',
					checked: false,
				},
			} );

			expect( editPost ).to.have.been.calledWith( DUMMY_SITE.ID, null, {
				discussion: {
					comment_status: 'closed',
					ping_status: 'closed',
				},
			} );
		} );
	} );
} );
