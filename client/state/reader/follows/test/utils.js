/** @format */
/**
 * Internal dependencies
 */
import { prepareComparableUrl } from '../utils';

describe( 'utils', () => {
	describe( '#prepareComparableUrl', () => {
		test( 'should reject an invalid URL', () => {
			const result = prepareComparableUrl( 'http://www.' );
			expect( result ).toBeNull();
		} );
	} );

	test( 'should format a valid URL nicely', () => {
		const result = prepareComparableUrl( 'http://www.EXAMPLE.com/bananas/feed' );
		expect( result ).toEqual( 'www.example.com/bananas/feed' );
	} );
} );
