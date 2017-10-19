/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	COMMENTS_CLEAR_SELECTED,
	COMMENTS_SELECT_ALL,
	COMMENTS_TOGGLE_SELECTED,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should default to an empty object', () => {
		const state = reducer( undefined, {} );

		expect( state ).to.eql( {} );
	} );

	test( 'should add a selected comment to the state', () => {
		const action = {
			type: COMMENTS_TOGGLE_SELECTED,
			siteId: 123456,
			postId: 1,
			commentId: 3,
		};
		const state = reducer( undefined, action );

		expect( state ).to.eql( { 123456: { 3: { commentId: 3, postId: 1 } } } );
	} );

	test( 'should remove a selected comment', () => {
		const state = deepFreeze( {
			123456: {
				2: { commentId: 2, postId: 1 },
				3: { commentId: 3, postId: 1 },
			},
		} );
		const action = {
			type: COMMENTS_TOGGLE_SELECTED,
			siteId: 123456,
			postId: 1,
			commentId: 2,
		};
		const newState = reducer( state, action );

		expect( newState ).to.eql( { 123456: { 3: { commentId: 3, postId: 1 } } } );
	} );

	test( 'should clear the state for the specified site', () => {
		const state = deepFreeze( {
			123456: {
				2: { commentId: 2, postId: 1 },
				3: { commentId: 3, postId: 1 },
			},
			654321: {
				2: { commentId: 2, postId: 1 },
				3: { commentId: 3, postId: 1 },
			},
		} );
		const action = {
			type: COMMENTS_CLEAR_SELECTED,
			siteId: 123456,
		};
		const newState = reducer( state, action );

		expect( newState ).to.eql( {
			654321: {
				2: { commentId: 2, postId: 1 },
				3: { commentId: 3, postId: 1 },
			},
		} );
	} );

	test( 'should ovewrite state with the specified comments', () => {
		const state = deepFreeze( {
			123456: {
				2: { commentId: 2, postId: 1 },
				3: { commentId: 3, postId: 1 },
			},
			654321: {
				2: { commentId: 2, postId: 1 },
				3: { commentId: 3, postId: 1 },
			},
		} );
		const comments = [
			{ commentId: 6, postId: 2 },
			{ commentId: 7, postId: 1 },
			{ commentId: 8, postId: 1 },
			{ commentId: 9, postId: 2 },
		];
		const action = {
			type: COMMENTS_SELECT_ALL,
			siteId: 123456,
			comments,
		};
		const newState = reducer( state, action );
		expect( newState ).to.eql( {
			123456: {
				6: { commentId: 6, postId: 2 },
				7: { commentId: 7, postId: 1 },
				8: { commentId: 8, postId: 1 },
				9: { commentId: 9, postId: 2 },
			},
			654321: {
				2: { commentId: 2, postId: 1 },
				3: { commentId: 3, postId: 1 },
			},
		} );
	} );
} );
