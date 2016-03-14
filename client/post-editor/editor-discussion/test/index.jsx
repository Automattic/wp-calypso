/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
import mockery from 'mockery';
import React from 'react';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import noop from 'lodash/noop';
import { mount, shallow } from 'enzyme';

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
		EditorDiscussion = require( '../' ).WrappedComponent;
		EditorDiscussion.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
	} );

	after( function() {
		delete EditorDiscussion.prototype.__reactAutoBindMap.translate;
	} );

	describe( '#getDiscussionSetting()', function() {
		it( 'should return an empty object if both post and site are unknown', function() {
			const wrapper = mount( <EditorDiscussion /> );
			expect( wrapper.node.getDiscussionSetting() ).to.eql( {} );
		} );

		it( 'should return the site default comments open if site exists and post is new', function() {
			var site = {
				options: {
					default_comment_status: true,
					default_ping_status: false
				}
			};

			const wrapper = mount( <EditorDiscussion site={ site } isNew /> );

			expect( wrapper.node.getDiscussionSetting() ).to.eql( {
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
			};

			const wrapper = mount( <EditorDiscussion site={ site } isNew /> );

			expect( wrapper.node.getDiscussionSetting() ).to.eql( {
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
			};
			const wrapper = mount( <EditorDiscussion post={ post } site={ DUMMY_SITE } /> );

			expect( wrapper.node.getDiscussionSetting() ).to.equal( post.discussion );
		} );
	} );

	describe( '#onChange', function() {
		var FormCheckbox = require( 'components/forms/form-checkbox' ),
			post = {
				discussion: {
					comment_status: 'closed',
					comments_open: false,
					ping_status: 'open',
					pings_open: true
				}
			};

		it( 'should include modified comment status on the post object', function() {
			var wrapper = shallow( <EditorDiscussion post={ post } site={ DUMMY_SITE } setDiscussionSettings={ function() {} } /> );

			wrapper
				.find( FormCheckbox )
				.filterWhere( n => n.prop( 'name' ) === 'ping_status' )
				.simulate( 'change', {
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
			var wrapper = shallow( <EditorDiscussion post={ post } site={ DUMMY_SITE } setDiscussionSettings={ function() {} } /> );

			wrapper
				.find( FormCheckbox )
				.filterWhere( n => n.prop( 'name' ) === 'ping_status' )
				.simulate( 'change', {
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
