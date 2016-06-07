/**
 * External dependencies
 */
import { nock, useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';

import {
	receivePosts
} from '../actions';

describe( 'actions', () => {
	useNock();

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
