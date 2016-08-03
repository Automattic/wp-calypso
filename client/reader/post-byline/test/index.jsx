/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { assert } from 'chai';
import { spy } from 'sinon';
import { each, partial, omit } from 'lodash';

/**
 * Internal dependencies
 */
 import useMockery from 'test/helpers/use-mockery';
 import { post } from './fixtures';

describe( 'PostByline', () => {
	let PostByline;
	const statsSpies = {
		recordAction: spy(),
		recordGaEvent: spy(),
		recordTrackForPost: spy(),
		recordPermalinkClick: spy()
	};

	useMockery( ( mockery ) => {
		mockery.registerMock( 'reader/stats', statsSpies );
	} );

	before( () => {
		PostByline = require( 'reader/post-byline' );
	} );

	describe( 'tracking', () => {
		let postByline;

		before( () => {
			postByline = shallow( <PostByline post={ post } /> );
		} );

		context( 'tag clicks', () => {
			before( () => {
				postByline.find( '.reader-post-byline__tag a' ).simulate( 'click' );
			} );

			after( () => {
				each( statsSpies, statSpy => statSpy.reset() );
			} );

			it( 'records the action', () => {
				assert.isTrue( statsSpies.recordAction.calledWith( 'click_tag' ) );
			} );

			it( 'records GA event', () =>{
				assert.isTrue( statsSpies.recordGaEvent.calledWith( 'Clicked Tag Link' ) );
			} );

			it( 'records track for post', () => {
				const [ keyArg, postArg, tagArg ] = statsSpies.recordTrackForPost.args[ 0 ];
				assert.equal( keyArg, 'calypso_reader_tag_clicked' );
				assert.deepEqual( postArg, post );
				assert.equal( tagArg.tag, post.primary_tag.slug );
			} );
		} );

		context( 'date clicks', () => {
			before( () => {
				postByline.find( '.reader-post-byline__date-link' ).simulate( 'click' );
			} );

			after( () => {
				each( statsSpies, statSpy => statSpy.reset() );
			} );

			it( 'records permalink clicks', () => {
				assert.isTrue( statsSpies.recordPermalinkClick.calledWith( 'timestamp' ) );
			} );

			it( 'records GA event', () => {
				assert.isTrue( statsSpies.recordGaEvent.calledWith( 'Clicked Post Permalink', 'timestamp' ) );
			} );
		} );

		context( 'author click', () => {
			before( () => {
				postByline.find( '.reader-post-byline__author' ).children().simulate( 'click' );
			} );

			it( 'records the action', () => {
				assert.isTrue( statsSpies.recordAction.calledWith( 'click_author' ) );
			} );

			it( 'records GA event', () =>{
				assert.isTrue( statsSpies.recordGaEvent.calledWith( 'Clicked Author Link' ) );
			} );

			it( 'records track for post', () => {
				const [ keyArg, postArg ] = statsSpies.recordTrackForPost.args[ 0 ];
				assert.equal( keyArg, 'calypso_reader_author_link_clicked' );
				assert.deepEqual( postArg, post );
			} );
		}	);
	} );

	describe( 'rendering', () => {
		describe( 'author block', () => {
			const authorSelector = '.reader-post-byline__author';

			it( 'does not render if the post does not have an author', () => {
				const authorLessByline = shallow( <PostByline post={ omit( post, 'author' ) } /> );
				assert.lengthOf( authorLessByline.find( authorSelector ), 0 );
			} );

			it( 'does not render if the post author does not have a name', () => {
				const author = omit( post.author, 'name' );
				const nameLessByline = shallow( <PostByline post={ Object.assign( {}, post, { author } ) } /> );
				assert.lengthOf( nameLessByline.find( authorSelector ), 0 );
			} );

			it( 'does not render if the post is a discover pick', () => {
				const discoverPick = shallow( <PostByline post={ post } isDiscoverPost={ true } /> );
				assert.lengthOf( discoverPick.find( authorSelector ), 0 );
			} );
		} );

		describe( 'date block', () => {
			const dateSelector = '.reader-post-byline__date';

			it( 'does not render if the post does not have a date', () => {
				const dateLess = shallow( <PostByline post={ omit( post, 'date' ) } /> );
				assert.lengthOf( dateLess.find( dateSelector ), 0 );
			} );

			it( 'does not render if the post does nto have an url', () => {
				const urlLess = shallow( <PostByline post={ omit( post, 'URL' ) } /> );
				assert.lengthOf( urlLess.find( dateSelector ), 0 );
			} );

			it( 'does not render external icon by default', () => {
				const postByline = shallow( <PostByline post={ post } /> );
				assert.notMatch( postByline.find( `${dateSelector}-link` ).text(), /<Gridicon \/>/ );
			} );

			it( 'renders an external icon if the props.icon is true', () => {
				const withIcon = shallow( <PostByline post={ post } icon={ true } /> );
				assert.match( withIcon.find( `${dateSelector}-link` ).text(), /<Gridicon \/>/ );
			} );
		} );

		describe( 'primary tag block', () => {
			it( 'does not render if the post does not have a primary tag', () =>{
				const primaryTagLess = shallow( <PostByline post={ omit( post, 'primary_tag' ) } /> );
				assert.lengthOf( primaryTagLess.find( '.reader-post-byline__tag' ), 0 );
			} );
		} );
	} );
} );
