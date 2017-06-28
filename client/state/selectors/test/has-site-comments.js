/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { hasSiteComments } from '../';

const state = deepFreeze( { comments: { items: { '2916284-1': [ {} ], '2916284-44': [ {} ] } } } );

describe( 'hasSiteComments()', () => {
	it( 'should return true if we have site comments', () => {
		expect( hasSiteComments( state, 2916284 ) ).to.equal( true );
	} );
	it( 'should return false if we do not have site comments', () => {
		expect( hasSiteComments( state, 77203074 ) ).to.equal( false );
	} );
} );
