/** @format */
/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { fromApi } from '../';

describe( 'fromApi', () => {
	test( 'transforms to standard output', () => {
		expect(
			fromApi( {
				found: 45,
				likes: [],
			} )
		).toEqual( {
			found: 45,
			likes: [],
			iLike: false,
		} );

		expect(
			fromApi( {
				found: '45',
				likes: [],
				i_like: true,
			} )
		).toEqual( {
			found: 45,
			likes: [],
			iLike: true,
		} );
	} );
} );
