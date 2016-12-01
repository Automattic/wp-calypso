/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_TYPES_RECEIVE,
	POST_TYPES_REQUEST,
	POST_TYPES_REQUEST_SUCCESS,
	POST_TYPES_REQUEST_FAILURE
} from 'state/action-types';
import {
	receivePostTypes,
	requestPostTypes
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receivePostTypes()', () => {
		it( 'should return an action object', () => {
			const action = receivePostTypes( 2916284, {
				post: { slug: 'post', label: 'Posts' }
			} );

			expect( action ).to.eql( {
				type: POST_TYPES_RECEIVE,
				siteId: 2916284,
				types: {
					post: { slug: 'post', label: 'Posts' }
				}
			} );
		} );
	} );

	describe( '#requestPostTypes()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/wp/v2/sites/2916284/types?context=edit' )
				.reply( 200, {
					post: { slug: 'post', label: 'Posts' },
					page: { slug: 'page', label: 'Pages' }
				} )
				.get( '/wp/v2/sites/77203074/types?context=edit' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPostTypes( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_TYPES_REQUEST,
				siteId: 2916284
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPostTypes( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( receivePostTypes( 2916284, {
					post: { slug: 'post', label: 'Posts' },
					page: { slug: 'page', label: 'Pages' }
				} ) );
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPostTypes( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_TYPES_REQUEST_SUCCESS,
					siteId: 2916284
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPostTypes( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_TYPES_REQUEST_FAILURE,
					siteId: 77203074,
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );
} );
