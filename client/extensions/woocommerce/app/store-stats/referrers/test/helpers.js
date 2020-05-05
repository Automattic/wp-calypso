/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { sortBySales } from '../helpers';

describe( 'sortBySales', () => {
	test( 'should return a sorted and trimmed array of referrer data', () => {
		const data = [ { sales: 2 }, { sales: 1 }, { sales: 5 }, { sales: 4 }, { sales: 3 } ];
		const sortedAndTrimmed = sortBySales( data, 3 );
		assert.lengthOf( sortedAndTrimmed, 3 );
		assert.deepEqual(
			sortedAndTrimmed.map( ( d ) => d.sales ),
			[ 5, 4, 3 ]
		);
	} );

	test( 'should return a sorted and untrimmed array if no limit is supplied', () => {
		const data = [ { sales: 2 }, { sales: 1 }, { sales: 5 }, { sales: 4 }, { sales: 3 } ];
		const sortedAndTrimmed = sortBySales( data );
		assert.lengthOf( sortedAndTrimmed, data.length );
	} );

	test( 'should throw on an incorrect data structure input', () => {
		const invalidData = {};
		const fn = () => {
			return sortBySales( invalidData );
		};
		assert.throws( fn );
	} );
} );
