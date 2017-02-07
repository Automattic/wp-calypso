/**
 * External Dependencies
 */
import { expect } from 'chai';

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
		receivePage( 'following', {}, [ ] );
		expect( false ).to.be.true;
	} );
} );

describe( 'single stream reducer', () => {
	it( 'should return an empty array by default', () => {
		expect( singleStreamReducer( undefined, {} ) ).to.eql( [] );
	} );
} );
