/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receivePostTypes, requestPostTypes } from '../actions';
import {
	POST_TYPES_RECEIVE,
	POST_TYPES_REQUEST,
	POST_TYPES_REQUEST_SUCCESS,
	POST_TYPES_REQUEST_FAILURE,
} from 'client/state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receivePostTypes()', () => {
		test( 'should return an action object', () => {
			const action = receivePostTypes( 2916284, [ { name: 'post', label: 'Posts' } ] );

			expect( action ).to.eql( {
				type: POST_TYPES_RECEIVE,
				siteId: 2916284,
				types: [ { name: 'post', label: 'Posts' } ],
			} );
		} );
	} );

	describe( '#requestPostTypes()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/post-types' )
				.reply( 200, {
					found: 2,
					post_types: [ { name: 'post', label: 'Posts' }, { name: 'page', label: 'Pages' } ],
				} )
				.get( '/rest/v1.1/sites/77203074/post-types' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestPostTypes( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_TYPES_REQUEST,
				siteId: 2916284,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestPostTypes( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receivePostTypes( 2916284, [
						{ name: 'post', label: 'Posts' },
						{ name: 'page', label: 'Pages' },
					] )
				);
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return requestPostTypes( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_TYPES_REQUEST_SUCCESS,
					siteId: 2916284,
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestPostTypes( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_TYPES_REQUEST_FAILURE,
					siteId: 77203074,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );
} );
