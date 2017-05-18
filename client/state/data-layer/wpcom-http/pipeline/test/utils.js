/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { buildKey } from '../utils';

const filler = { type: 'FILL' };
const succeeder = { type: 'SUCCEED' };

describe( '#buildKey', () => {
	it( 'should collapse "duplicate" requests', () => {
		const duplicates = [ [
			{ path: '/', apiNamespace: 'wpcom/v2', query: { id: 1, limit: 5 } },
			{ path: '/', apiNamespace: 'wpcom/v2', query: { limit: 5, id: 1 } },
		], [
			{ path: '/' },
			{ path: '/', query: undefined },
		], [
			{ path: '/' },
			{ path: '/', query: {} },
		], [
			{ path: '/' },
			{ path: '/', apiNamespace: undefined }
		], [
			{ path: '/', onSuccess: succeeder },
			{ path: '/', onSuccess: filler },
		] ];

		duplicates.forEach( ( [ a, b ] ) => expect( buildKey( a ) ).to.equal( buildKey( b ) ) );
	} );

	it( 'should differentiate "unique" requests', () => {
		const uniques = [ [
			{ path: '/', apiNamespace: 'wp/v1' },
			{ path: '/', apiNamespace: 'wpcom/v1' },
		], [
			{ path: '/', apiNamespace: 'wp/v1' },
			{ path: '/', apiVersion: 'wp/v1' },
		], [
			{ path: '/' },
			{ path: '/a' },
		], [
			{ path: '/', query: { id: 1 } },
			{ path: '/', query: { id: 2 } },
		] ];

		uniques.forEach( ( [ a, b ] ) => expect( buildKey( a ) ).to.not.equal( buildKey( b ) ) );
	} );
} );
