/**
 * External Dependencies
 */
import { expect } from 'chai';
import deepfreeze from 'deep-freeze';

/**
 * Internal Dependencies
 */
import { receivePage } from '../actions';
import streamReducer, { singleStreamReducer } from '../reducer';

describe( 'stream reducer', () => {
	it( 'should return an empty object by default', () => {
		expect( streamReducer( undefined, {} ) ).to.eql( {} );
	} );

	it( 'should put a stream under the right key', () => {
		const startState = deepfreeze( {} );
		const action = receivePage( 'following', { }, [
			{ global_ID: 1234 }
		] );
		expect( streamReducer( startState, action ) ).to.eql( {
			following: [ 1234 ]
		} );
	} );
} );

describe( 'single stream reducer', () => {
	it( 'should return an empty array by default', () => {
		expect( singleStreamReducer( undefined, {} ) ).to.eql( [] );
	} );
} );
