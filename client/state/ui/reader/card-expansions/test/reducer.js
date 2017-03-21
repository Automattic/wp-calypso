/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_EXPAND_CARD,
	READER_RESET_CARD_EXPANSIONS,
} from 'state/action-types';
import reducer from '../reducer';
import { keyToString } from 'lib/feed-stream-store/post-key';

describe( 'reducer', () => {
	const postKey = { postId: 'postId', blogId: 'blogId' };
	it( 'should default to empty object', () => {
		const action = {};
		const prevState = undefined;
		const nextState = reducer( prevState, action );
		expect( nextState ).eql( {} );
	} );

	it( 'should add a newly expanded card to state', () => {
		const action = {
			type: READER_EXPAND_CARD,
			payload: { postKey }
		};
		const prevState = {};
		const nextState = reducer( prevState, action );
		expect( nextState ).eql( {
			[ keyToString( postKey ) ]: true,
		} );
	} );

	it( 'should clear the entire state on a reset', () => {
		const action = { type: READER_RESET_CARD_EXPANSIONS };
		const prevState = {
			[ keyToString( postKey ) ]: true,
		};
		const nextState = reducer( prevState, action );
		expect( nextState ).eql( {} );
	} );
} );
