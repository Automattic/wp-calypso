/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should default to a backPath of /design', () => {
		expect( reducer( undefined, {} ) ).to.eql( { backPath: '/design' } );
	} );
} );

