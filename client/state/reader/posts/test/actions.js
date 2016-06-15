/**
 * External dependencies
 */
import { useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';
import useMockery from 'test/helpers/use-mockery';

describe( 'actions', () => {
	let receivePosts;

	useNock();

	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {
			tracks: {
				recordEvent: function() {}
			}
		} );

		receivePosts = require( '../actions' ).receivePosts;
	} );

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receivePosts()', () => {
		it( 'should return an action object', () => {
			const posts = [];
			return receivePosts( posts )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts
				} );
			} );
		} );
	} );
} );
