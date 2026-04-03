import { fromApi } from '@automattic/api-core';

describe( 'fromApi', () => {
	test( 'transforms to standard output', () => {
		expect(
			fromApi( {
				found: 45,
				i_like: false,
				likes: [],
			} )
		).toEqual( {
			found: 45,
			iLike: false,
			likes: [],
		} );
	} );

	test( 'coerces found to number and i_like to boolean', () => {
		expect(
			fromApi( {
				found: '45',
				i_like: true,
				likes: [],
			} )
		).toEqual( {
			found: 45,
			iLike: true,
			likes: [],
		} );
	} );
} );
