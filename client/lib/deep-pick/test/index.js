/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import pick from '..';

describe( 'lib/deep-pick', () => {
	const data = {
		a: {
			aa: 11,
			ab: 12,
		},
		b: 2,
		c: 3,
	};

	it( 'works like lodash for non-nested properties', () => {
		expect( pick( data, 'b' ) ).to.eql( { b: 2 } );
		expect( pick( data, [ 'b' ] ) ).to.eql( { b: 2 } );
		expect( pick( data, [ 'c', 'b' ] ) ).to.eql( { c: 3, b: 2 } );
	} );

	it( 'also supports nested properties', () => {
		expect( pick( data, 'a.aa' ) ).to.eql( { 'a.aa': 11 } );
		expect( pick( data, [ 'a.aa', 'c', 'a' ] ) ).to.eql( {
			'a.aa': 11,
			c: 3,
			a: { aa: 11, ab: 12 },
		} );
	} );
} );
