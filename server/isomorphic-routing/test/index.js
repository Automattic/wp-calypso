/** @format */

/**
 * Internal dependencies
 */
import { zip } from 'lodash';
import { getNormalizedPath } from '..';

describe( 'getNormalizedPath', () => {
	test( 'should return expected results for a variety of inputs', () => {
		const paths = [ '', '/', '/shortpath', '/a/longer/path' ];
		const queries = [ {}, { a: 'query' }, { '': 'a=query' } ];

		zip( paths, queries ).forEach( ( [ pathname, query ] ) =>
			expect( getNormalizedPath( pathname, query ) ).toMatchSnapshot()
		);
	} );

	test( 'should return pathname for routes with no query', () => {
		const pathname = '/my/path';
		const query = {};

		expect( getNormalizedPath( pathname, query ) ).toBe( '/my/path' );
	} );

	test( 'should return cacheKey for a known query param', () => {
		const pathname = '/';
		const query = { cache_me: '1' };

		expect( getNormalizedPath( pathname, query ) ).toBe( '/?cache_me=1' );
	} );

	test( 'should return cacheKey for multiple known query params', () => {
		const pathname = '/';
		const query = { cache_me: '1', and_me: '2', me_too: '3' };

		expect( getNormalizedPath( pathname, query ) ).toBe( '/?and_me=2&cache_me=1&me_too=3' );
	} );

	test( 'should return a stable key pathname', () => {
		const pathname = '/';
		const query = { a: '1', b: '2' };
		const querySwapped = { b: '2', a: '1' };

		expect( getNormalizedPath( pathname, query ) ).toBe(
			getNormalizedPath( pathname, querySwapped )
		);
	} );

	test( 'should handle "empty" query params coherently', () => {
		expect( getNormalizedPath( '/', { empty: '' } ) ).toBe(
			getNormalizedPath( '/', { empty: null } )
		);
		expect( getNormalizedPath( '/', { empty: '' } ) ).toBe(
			getNormalizedPath( '/', { empty: undefined } )
		);
	} );

	test( 'should produce unique results', () => {
		expect( getNormalizedPath( '/?a=query', {} ) ).not.toBe(
			getNormalizedPath( '/', { a: 'query' } )
		);

		expect( getNormalizedPath( '/', { key: 'val' } ) ).not.toBe(
			getNormalizedPath( '/', { 'key=val': '' } )
		);
	} );
} );
