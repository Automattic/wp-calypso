/** @jest-environment jsdom */
jest.mock( 'components/info-popover', () => require( 'components/empty-component' ) );
jest.mock( 'lib/posts/actions', () =>( {
	edit: require( 'sinon' ).spy()
} ) );
jest.mock( 'lib/posts/stats', () => ( {
	recordEvent: () => {},
	recordStat: () => {}
} ) );

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import EditorDiscussion from '../';
import { edit as editPost } from 'lib/posts/actions';

/**
 * Module variables
 */
const DUMMY_SITE = {
	options: {
		default_comment_status: true,
		default_ping_status: false
	}
};

describe( 'EditorDiscussion', function() {
	before( function() {
		EditorDiscussion.prototype.translate = sinon.stub().returnsArg( 0 );
	} );

	beforeEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	after( function() {
		delete EditorDiscussion.prototype.translate;
	} );

	describe( '#getDiscussionSetting()', function() {
		it( 'should return an empty object if both post and site are unknown', function() {
			var tree = TestUtils.renderIntoDocument(
				<EditorDiscussion />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {} );
		} );

		it( 'should return the site default comments open if site exists and post is new', function() {
			var site = {
				options: {
					default_comment_status: true,
					default_ping_status: false
				}
			}, post = {
				type: 'post'
			}, tree;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ site } post={ post } isNew />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {
				comment_status: 'open',
				ping_status: 'closed'
			} );
		} );

		it( 'should return the site default pings open if site exists and post is new', function() {
			var site = {
				options: {
					default_comment_status: false,
					default_ping_status: true
				}
			}, post = {
				type: 'post'
			}, tree;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ site } post={ post } isNew />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {
				comment_status: 'closed',
				ping_status: 'open'
			} );
		} );

		it( 'should return comments closed if site exists, post is new, and post is type page', function() {
			var site = {
				options: {
					default_comment_status: false,
					default_ping_status: true
				}
			}, post = {
				type: 'page'
			}, tree;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ site } post={ post } isNew />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {
				comment_status: 'closed',
				ping_status: 'closed'
			} );
		} );

		it( 'should return the saved post values', function() {
			var post = {
				discussion: {
					comment_status: 'open',
					ping_status: 'closed'
				}
			}, tree;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion post={ post } site={ DUMMY_SITE } />
			);

			expect( tree.getDiscussionSetting() ).to.equal( post.discussion );
		} );
	} );

	describe( '#onChange', function() {
		var post = {
			discussion: {
				comment_status: 'closed',
				comments_open: false,
				ping_status: 'open',
				pings_open: true
			}
		};

		it( 'should include modified comment status on the post object', function() {
			var tree, checkbox;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion post={ post } site={ DUMMY_SITE } setDiscussionSettings={ function() {} } />
			);

			checkbox = ReactDom.findDOMNode( tree ).querySelector( '[name=ping_status]' );
			TestUtils.Simulate.change( checkbox, {
				target: {
					name: 'comment_status',
					checked: true
				}
			} );

			expect( editPost ).to.have.been.calledWith( {
				discussion: {
					comment_status: 'open',
					ping_status: 'open'
				}
			} );
		} );

		it( 'should include modified ping status on the post object', function() {
			var tree, checkbox;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion post={ post } site={ DUMMY_SITE } setDiscussionSettings={ function() {} } />
			);

			checkbox = ReactDom.findDOMNode( tree ).querySelector( '[name=ping_status]' );
			TestUtils.Simulate.change( checkbox, {
				target: {
					name: 'ping_status',
					checked: false
				}
			} );

			expect( editPost ).to.have.been.calledWith( {
				discussion: {
					comment_status: 'closed',
					ping_status: 'closed'
				}
			} );
		} );
	} );
} );
