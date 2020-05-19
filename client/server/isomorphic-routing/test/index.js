/**
 * Internal dependencies
 */
import { getNormalizedPath } from '..';

describe( 'getNormalizedPath', () => {
	test( 'should return expected results for a variety of inputs', () => {
		const pathnames = [ '/', '/shortpath', '/a/longer/path', '/specialchars/%2F%3F%26%3D%25' ];
		const queries = [
			{},
			{ a: 'query' },
			{ '?tricky=query': '' },
			{ key: '=tricky&value=;)' },
			{ emptyValue: '' },
			{ nullValue: null },
		];

		// Cartesian product: paths * queries
		pathnames.forEach( ( pathname ) =>
			queries.forEach( ( query ) =>
				expect( getNormalizedPath( pathname, query ) ).toMatchSnapshot()
			)
		);
	} );

	test( 'should return pathname for routes with no query', () => {
		const pathname = '/my/path';
		const query = {};

		expect( getNormalizedPath( pathname, query ) ).toBe( '/my/path' );
	} );

	test( 'should return normalized path for one query param', () => {
		const pathname = '/';
		const query = { cache_me: '1' };

		expect( getNormalizedPath( pathname, query ) ).toBe( '/?cache_me=1' );
	} );

	test( 'should return normalized pathname for multiple query params', () => {
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
	} );

	test( 'should produce unique results', () => {
		expect( getNormalizedPath( '/', { key: 'val' } ) ).not.toBe(
			getNormalizedPath( '/', { 'key=val': '' } )
		);
	} );
} );
