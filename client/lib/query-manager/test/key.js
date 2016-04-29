/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import QueryKey from '../key';

describe( 'QueryKey', () => {
	describe( '.stringify()', () => {
		it( 'should return a JSON string of the object', () => {
			const key = QueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '{"ok":true}' );
		} );
	} );

	describe( '.parse()', () => {
		it( 'should return an object of the JSON string', () => {
			const query = QueryKey.parse( '{"ok":true}' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
