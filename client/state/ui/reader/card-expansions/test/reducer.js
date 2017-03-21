/**
 * External dependencies
 */
import { expect } from 'chai';
import freeze from 'deep-freeze';

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
	const postKey = freeze( { postId: 'postId', blogId: 'blogId' } );

	it( 'should default to empty object', () => {
		const action = freeze( {} );
		const prevState = undefined;
		const nextState = reducer( prevState, action );
		expect( nextState ).eql( {} );
	} );

	it( 'should add a newly expanded card to state', () => {
		const action = freeze( {
			type: READER_EXPAND_CARD,
			payload: { postKey }
		} );
		const prevState = freeze( {} );
		const nextState = reducer( prevState, action );
		expect( nextState ).eql( {
			[ keyToString( postKey ) ]: true,
		} );
	} );

	it( 'should clear the entire state on a reset', () => {
		const action = freeze( { type: READER_RESET_CARD_EXPANSIONS } );
		const prevState = freeze( {
			[ keyToString( postKey ) ]: true,
		} );
		const nextState = reducer( prevState, action );
		expect( nextState ).eql( {} );
	} );
} );
