/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT } from 'woocommerce/state/action-types';

const initialState = {
	123: {
		edits: { currentlyEditingId: 1, reviewId: 12, changes: { content: 'Hello' } },
	},
};

describe( 'reducer', () => {
	test( 'should track the reply edits for more than one site', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
			siteId: 234,
			reviewId: 55,
			reply: {
				id: 2,
				content: 'World',
			},
		};
		const originalState = deepFreeze( initialState );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			123: {
				edits: { currentlyEditingId: 1, reviewId: 12, changes: { content: 'Hello' } },
			},
			234: {
				edits: { currentlyEditingId: 2, reviewId: 55, changes: { content: 'World' } },
			},
		} );
	} );
} );
