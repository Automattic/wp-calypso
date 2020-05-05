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
	WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT,
	WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	test( 'should store the currently editing reply', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
			siteId: 123,
			reviewId: 12,
			reply: {
				id: 50,
				content: 'testing...',
			},
		};
		const newState = reducer( undefined, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 50,
			reviewId: 12,
			changes: {
				content: 'testing...',
			},
		} );
	} );

	test( "should update the reply when it's changed", () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
			siteId: 123,
			reviewId: 12,
			reply: {
				id: 50,
				content: 'Update',
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 50,
			reviewId: 12,
			changes: {
				content: 'Original',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 50,
			reviewId: 12,
			changes: {
				content: 'Update',
			},
		} );
	} );

	test( 'should merge updates to a reply if new fields are passed in', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
			siteId: 123,
			reviewId: 12,
			reply: {
				id: 50,
				status: 'trash',
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 50,
			reviewId: 12,
			changes: {
				content: 'Hello',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: 50,
			reviewId: 12,
			changes: {
				content: 'Hello',
				status: 'trash',
			},
		} );
	} );

	test( 'should store a generated ID for a created reply', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
			siteId: 123,
			reviewId: 12,
			reply: {
				content: 'New reply',
			},
		};
		const newState = reducer( undefined, action );
		expect( newState.currentlyEditingId.placeholder ).to.exist;
		expect( newState.changes ).to.eql( {
			content: 'New reply',
		} );
	} );

	test( 'should merge updates to a new reply if additional fields are passed in', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
			siteId: 123,
			reviewId: 12,
			reply: {
				id: { placeholder: 'review_reply_1' },
				status: 'trash',
			},
		};
		const originalState = deepFreeze( {
			currentlyEditingId: { placeholder: 'review_reply_1' },
			reviewId: 12,
			changes: {
				content: 'Hello',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: { placeholder: 'review_reply_1' },
			reviewId: 12,
			changes: {
				content: 'Hello',
				status: 'trash',
			},
		} );
	} );

	test( 'should clear reply changes from the state when requested', () => {
		const action = {
			type: WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT,
			siteId: 123,
		};
		const originalState = deepFreeze( {
			currentlyEditingId: 50,
			reviewId: 12,
			changes: {
				content: 'Hello',
			},
		} );
		const newState = reducer( originalState, action );
		expect( newState ).to.eql( {
			currentlyEditingId: null,
			reviewId: null,
			changes: {},
		} );
	} );
} );
