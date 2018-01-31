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
				success: true,
				like_count: 45,
			} )
		).toEqual( {
			success: true,
			likeCount: 45,
		} );

		expect(
			fromApi( {
				// just in case
				success: 1,
				like_count: '45',
			} )
		).toEqual( {
			success: true,
			likeCount: 45,
		} );
	} );
} );
