/**
 * External Dependencies
*/
import { assert } from 'chai';

/**
 * Internal Dependencies
 */
import { areEqualIgnoringWhitespaceAndCase } from '../';

describe( 'lib/string/areEqualIgnoringWhitespaceAndCase', () => {
	it( 'should match', () => {
		const pairs = [
			// actual, expected
			[ '', '' ],
			[ 'hi there', 'Hi There' ],
			[ 'hithere', 'Hi There' ],
			[ 'hi-there', 'Hi There.' ],
			[ 'hi_there', 'Hi THERE' ]
		];
		pairs.forEach( ( pair ) => {
			assert.isTrue(
				areEqualIgnoringWhitespaceAndCase( pair[ 0 ], pair[ 1 ] ),
				`'${ pair[ 0 ] }' v '${ pair[ 1 ] }'`
			);
		} );
	} );
} );
