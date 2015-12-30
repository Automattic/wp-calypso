/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils,
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	mockery = require( 'mockery' ),
	chai = require( 'chai' ),
	noop = require( 'lodash/utility/noop' ),
	expect = chai.expect;

chai.use( sinonChai );
const MOCK_COMPONENT = React.createClass( {
	render: function() {
		return null;
	}
} );

/**
 * Module variables
 */
var DUMMY_SITE = {
	options: {
		default_comment_status: true,
		default_ping_status: false
	}
};

describe( 'EditorDiscussion', function() {
	var editPost, EditorDiscussion;

	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		editPost = sinon.spy();
		mockery.registerMock( 'components/info-popover', MOCK_COMPONENT );
		mockery.registerMock( 'lib/posts/actions', {
			edit: editPost
		} );
		mockery.registerMock( 'lib/posts/stats', {
			recordEvent: noop,
			recordStat: noop
		} );
		EditorDiscussion = require( '../' );
		EditorDiscussion.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
	} );

	beforeEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	after( function() {
		delete EditorDiscussion.prototype.__reactAutoBindMap.translate;
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
			}, tree;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ site } isNew />
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
			}, tree;

			tree = TestUtils.renderIntoDocument(
				<EditorDiscussion site={ site } isNew />
			);

			expect( tree.getDiscussionSetting() ).to.eql( {
				comment_status: 'closed',
				ping_status: 'open'
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
				<EditorDiscussion post={ post } site={ DUMMY_SITE } />
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
				<EditorDiscussion post={ post } site={ DUMMY_SITE } />
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
