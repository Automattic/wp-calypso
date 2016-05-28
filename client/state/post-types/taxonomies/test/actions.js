/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_TYPES_TAXONOMIES_RECEIVE,
	POST_TYPES_TAXONOMIES_REQUEST,
	POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
	POST_TYPES_TAXONOMIES_REQUEST_FAILURE
} from 'state/action-types';
import {
	receivePostTypeTaxonomies,
	requestPostTypeTaxonomies
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#receivePostTypeTaxonomies()', () => {
		it( 'should return an action object', () => {
			const action = receivePostTypeTaxonomies( 2916284, 'post', [
				{ name: 'category', label: 'Categories' }
			] );

			expect( action ).to.eql( {
				type: POST_TYPES_TAXONOMIES_RECEIVE,
				siteId: 2916284,
				postType: 'post',
				taxonomies: [ { name: 'category', label: 'Categories' } ]
			} );
		} );
	} );

	describe( '#requestPostTypeTaxonomies()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/post-types/post/taxonomies' )
				.reply( 200, {
					found: 2,
					taxonomies: [
						{ name: 'category', label: 'Categories' },
						{ name: 'post_tag', label: 'Tags' }
					]
				} )
				.get( '/rest/v1.1/sites/2916284/post-types/foo/taxonomies' )
				.reply( 404, {
					error: 'unknown_post_type',
					message: 'Unknown post type'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPostTypeTaxonomies( 2916284, 'post' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 2916284,
				postType: 'post'
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPostTypeTaxonomies( 2916284, 'post' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receivePostTypeTaxonomies( 2916284, 'post', [
						{ name: 'category', label: 'Categories' },
						{ name: 'post_tag', label: 'Tags' }
					] )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPostTypeTaxonomies( 2916284, 'post' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
					siteId: 2916284,
					postType: 'post'
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPostTypeTaxonomies( 2916284, 'foo' )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
					siteId: 2916284,
					postType: 'foo',
					error: sinon.match( { message: 'Unknown post type' } )
				} );
			} );
		} );
	} );
} );
