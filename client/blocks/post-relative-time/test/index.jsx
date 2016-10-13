/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { PostRelativeTime } from 'blocks/post-relative-time';

describe( 'PostRelativeTime', () => {
	it( 'should contain a time gridicon', () => {
		const wrapper = shallow(
			<PostRelativeTime
				moment={ moment }
			/>
		);

		const icon = wrapper.find( '.post-relative-time__icon' );
		expect( icon.props().icon ).to.be.equal( 'time' );
		expect( icon.props().size ).to.be.equal( 18 );
	} );

	it( 'should display a recent time if there is no post', () => {
		const post = null;

		const wrapper = shallow(
			<PostRelativeTime
				post={ post }
				moment={ moment }
			/>
		);

		const text = wrapper.find( '.post-relative-time__text' ).text();
		expect( text ).to.equal( 'a few seconds ago' );
	} );

	it( 'should use the modified date if the post status is draft', () => {
		const post = {
			status: 'draft',
			modified: '2016-09-14T15:47:33-04:00',
			date: '2016-09-13T15:47:33-04:00'
		};

		const wrapper = shallow(
			<PostRelativeTime
				post={ post }
				moment={ moment }
			/>
		);

		const text = wrapper.find( '.post-relative-time__text' ).text();
		expect( text ).to.equal( moment( post.modified ).fromNow() );
	} );

	it( 'should use the modified date if the post status is pending', () => {
		const post = {
			status: 'pending',
			modified: '2016-09-14T15:47:33-04:00',
			date: '2016-09-13T15:47:33-04:00'
		};

		const wrapper = shallow(
			<PostRelativeTime
				post={ post }
				moment={ moment }
			/>
		);

		const text = wrapper.find( '.post-relative-time__text' ).text();
		expect( text ).to.equal( moment( post.modified ).fromNow() );
	} );

	it( 'should use the actual date if the post status is not pending/draft', () => {
		const post = {
			status: 'publish',
			modified: '2016-09-14T15:47:33-04:00',
			date: '2016-09-13T15:47:33-04:00'
		};

		const wrapper = shallow(
			<PostRelativeTime
				post={ post }
				moment={ moment }
			/>
		);

		const text = wrapper.find( '.post-relative-time__text' ).text();
		expect( text ).to.equal( moment( post.date ).fromNow() );
	} );

	it( 'should render placeholder when post is null', () => {
		const post = null;

		const wrapper = shallow(
			<PostRelativeTime
				post={ post }
				moment={ moment }
			/>
		);

		expect( wrapper.hasClass( 'is-placeholder' ) ).to.be.true;
	} );
} );
