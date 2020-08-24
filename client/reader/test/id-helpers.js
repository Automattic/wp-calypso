/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { toValidId } from '../id-helpers';

describe( 'toValidId', () => {
	const testCases = [
		[ undefined, undefined ],
		[ null, undefined ],
		[ 0, undefined ],
		[ '0', undefined ],
		[ false, undefined ],
		[ true, undefined ],
		[ 1, 1 ],
		[ '1', 1 ],
		[ 4, 4 ],
		[ '4', 4 ],
		[ '4.8', undefined ],
		[ 1 / 0, undefined ],
	];

	testCases.forEach( function ( testCase ) {
		const [ provided, expected ] = testCase;
		test( `'${ provided }' should yield '${ expected }'`, () => {
			expect( toValidId( provided ) ).to.equal( expected );
		} );
	} );
} );
