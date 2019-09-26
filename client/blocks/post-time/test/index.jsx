/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import moment from 'moment';
import React from 'react';

/**
 * Internal dependencies
 */
import { PostTime } from 'blocks/post-time';

describe( 'PostTime', () => {
	test( 'should display a recent time if there is no post', () => {
		const post = null;

		const wrapper = shallow( <PostTime post={ post } moment={ moment } /> );

		const text = wrapper.text();
		expect( text ).to.equal( 'a few seconds ago' );
	} );

	test( 'should use the modified date if the post status is draft', () => {
		const post = {
			status: 'draft',
			modified: '2016-09-14T15:47:33-04:00',
			date: '2016-09-13T15:47:33-04:00',
		};

		const wrapper = shallow( <PostTime post={ post } moment={ moment } /> );

		const text = wrapper.text();
		expect( text ).to.equal( moment( post.modified ).format( 'lll' ) );
	} );

	test( 'should use the modified date if the post status is pending', () => {
		const post = {
			status: 'pending',
			modified: '2016-09-14T15:47:33-04:00',
			date: '2016-09-13T15:47:33-04:00',
		};

		const wrapper = shallow( <PostTime post={ post } moment={ moment } /> );

		const text = wrapper.text();
		expect( text ).to.equal( moment( post.modified ).format( 'lll' ) );
	} );

	test( 'should use the actual date if the post status is not pending/draft', () => {
		const post = {
			status: 'publish',
			modified: '2016-09-14T15:47:33-04:00',
			date: '2016-09-13T15:47:33-04:00',
		};

		const wrapper = shallow( <PostTime post={ post } moment={ moment } /> );

		const text = wrapper.text();
		expect( text ).to.equal( moment( post.date ).format( 'lll' ) );
	} );

	test( 'should use a human-readable approximation for recent dates', () => {
		const post = {
			status: 'publish',
			date: moment()
				.subtract( 2, 'days' )
				.format(),
		};

		const wrapper = shallow( <PostTime post={ post } moment={ moment } /> );

		const text = wrapper.text();
		expect( text ).to.equal( '2 days ago' );
	} );

	test( 'should render placeholder when post is null', () => {
		const post = null;

		const wrapper = shallow( <PostTime post={ post } moment={ moment } /> );

		expect( wrapper.hasClass( 'is-placeholder' ) ).to.be.true;
	} );
} );
