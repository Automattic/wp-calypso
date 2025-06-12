// @ts-nocheck - TODO: Fix TypeScript issues
import { groupBy, pickBy } from 'lodash';
import { countries } from '../data';
import {
	indexOfLongestCommonSuffix,
	indexOfStrictSubsequenceEnd,
	nonDigitsAtStart,
	numDigitsBeforeIndex,
	getUpdatedCursorPosition,
} from '../phone-number';

describe( 'Data assertion', function () {
	// Generates a list of countries that share the dial code, with following properties:
	// isoCode, dialCode, nationalPrefix, patternRegion, priority
	const countriesShareDialCode = pickBy(
		groupBy( Object.values( countries ), 'dialCode' ),
		( val ) => val.length > 1
	);

	describe( 'countries sharing dial code should have priority data', function () {
		Object.entries( countriesShareDialCode ).map( ( [ dialCode, countriesWithDialCode ] ) => {
			describe( 'Dialcode: ' + dialCode, function () {
				countriesWithDialCode.forEach( function ( country ) {
					test( `${ country.isoCode } has priority`, function () {
						expect( country.priority ).toBeTruthy();
					} );
				} );
			} );
		} );
	} );
} );

describe( 'indexOfLongestCommonSuffix', function () {
	test.each( [
		{ array1: [], array2: [], expected: [ 0, 0 ] },
		{ array1: [ 'a' ], array2: [], expected: [ 1, 0 ] },
		{ array1: [], array2: [ 'a' ], expected: [ 0, 1 ] },
		{ array1: [ 'a' ], array2: [ 'a' ], expected: [ 0, 0 ] },
		{ array1: [ 'a', 'b', 'c' ], array2: [ 'a', 'b', 'c' ], expected: [ 0, 0 ] },
		{ array1: [ 'a', 'b', 'c' ], array2: [ 'a', 'b', 'c', 'd' ], expected: [ 3, 4 ] },
		{ array1: [ 'a', 'b', 'c' ], array2: [ 'b', 'c' ], expected: [ 1, 0 ] },
		{ array1: [ 'x', 'y', 'z' ], array2: [ 'a', 'b', 'c', 'd' ], expected: [ 3, 4 ] },
	] )(
		'Correct index for longest suffix is found for inputs $array1, $array2',
		function ( { array1, array2, expected } ) {
			const result = indexOfLongestCommonSuffix( array1, array2 );
			expect( result ).toStrictEqual( expected );
		}
	);
} );

describe( 'indexOfStrictSubsequenceEnd', function () {
	test.each( [
		{ array1: [ 'a', 'b' ], array2: [ 'a', 'b', 'c' ], expected: 2 },
		{ array1: [ 'a', 'b' ], array2: [ 'a', 'd', 'b', 'c' ], expected: 3 },
	] )(
		'Correct index for subsequence is found for inputs $array1, $array2',
		function ( { array1, array2, expected } ) {
			const result = indexOfStrictSubsequenceEnd( array1, array2 )[ 0 ];
			expect( result ).toStrictEqual( expected );
		}
	);
} );

describe( 'nonDigitsAtStart', function () {
	test.each( [
		{ input: [ '1', '2', '3' ], expected: 0 },
		{ input: [ 'x', 'y', 'z' ], expected: 3 },
		{ input: [ 'x', 'y', '7' ], expected: 2 },
		{ input: [ 'x', 'y', '7', 'z' ], expected: 2 },
	] )( 'Returns correct index of first digit for input $input', function ( { input, expected } ) {
		const result = nonDigitsAtStart( input );
		expect( result ).toEqual( expected );
	} );
} );

describe( 'numDigitsBeforeIndex', function () {
	test.each( [
		{ input: [], index: 1, expected: 0 },
		{ input: [ '1', '2', '3', '4' ], index: 3, expected: 3 },
		{ input: [ '1', '2', '3', '4' ], index: 4, expected: 4 },
		{ input: [ '1', '2', '3', '4' ], index: 5, expected: 4 },
		{ input: [ '1', 'x', '3', '4' ], index: 3, expected: 2 },
		{ input: [ '1', 'x', '3', '4' ], index: 4, expected: 3 },
		{ input: [ '1', 'x', '3', '4' ], index: 5, expected: 3 },
		{ input: [ 'x', 'y', 'z', 'w' ], index: 3, expected: 0 },
		{ input: [ 'x', 'y', 'z', 'w' ], index: 4, expected: 0 },
		{ input: [ 'x', 'y', 'z', 'w' ], index: 5, expected: 0 },
	] )( 'Returns correct cutoff index for input $input', function ( { input, index, expected } ) {
		const result = numDigitsBeforeIndex( input, index );
		expect( result ).toEqual( expected );
	} );
} );

describe( 'getUpdatedCursorPosition', function () {
	test.each( [
		{ oldvalue: '', newvalue: '+', position: 1, expected: 1 },
		{ oldvalue: '+5', newvalue: '+', position: 2, expected: 1 },
		{ oldvalue: '555', newvalue: '+', position: 3, expected: 1 },
		{ oldvalue: '23', newvalue: '234', position: 2, expected: 3 },
		{ oldvalue: '234', newvalue: '234-5', position: 3, expected: 5 },
		{ oldvalue: '223-2', newvalue: '223-22', position: 5, expected: 6 },
		{ oldvalue: '223-2', newvalue: '223-232', position: 5, expected: 7 },
		{ oldvalue: '223-2', newvalue: '223-22', position: 4, expected: 5 },
		{ oldvalue: '223-2', newvalue: '223-22', position: 3, expected: 5 },
		{ oldvalue: '223-25', newvalue: '223-225', position: 5, expected: 6 },
		{ oldvalue: '223-25', newvalue: '223-2325', position: 5, expected: 7 },
		{ oldvalue: '223-25', newvalue: '223-225', position: 4, expected: 5 },
		{ oldvalue: '223-25', newvalue: '223-225', position: 3, expected: 5 },
		{ oldvalue: '234-5', newvalue: '234', position: 5, expected: 3 },
		{ oldvalue: '+1 234', newvalue: '+1 234-5', position: 6, expected: 8 },
		{ oldvalue: '(802) 234', newvalue: '(802) 234-5', position: 9, expected: 11 },
		{ oldvalue: '802-2343', newvalue: '(802) 234-39', position: 8, expected: 12 },
		{ oldvalue: '(802) 234-39', newvalue: '802-2343', position: 12, expected: 8 },
		{ oldvalue: '(802) 234-3943', newvalue: '(802) 233-943', position: 9, expected: 8 },
		{ oldvalue: '(802) 687-6234', newvalue: '802-6234', position: 6, expected: 3 },
		{ oldvalue: '(802) 687-6234', newvalue: '(802) 555-6234', position: 6, expected: 9 },
		{ oldvalue: '124', newvalue: '1234', position: 2, expected: 3 },
		{ oldvalue: '124', newvalue: '123-4', position: 2, expected: 3 },
		{ oldvalue: '224', newvalue: '223-764', position: 2, expected: 6 },
		{ oldvalue: '124-4', newvalue: '124-64', position: 4, expected: 5 },
		{ oldvalue: '(802) 614-21', newvalue: '(802) 619-421', position: 8, expected: 9 },
		{ oldvalue: '(802) 222-2222', newvalue: '6', position: 14, expected: 1 },
		{ oldvalue: '+1 802 222-2222', newvalue: '6', position: 15, expected: 1 },
	] )(
		'Returns correct cursor position for inputs $oldvalue, $newvalue',
		function ( { oldvalue, newvalue, position, expected } ) {
			const result = getUpdatedCursorPosition( oldvalue, newvalue, position );
			expect( result ).toEqual( expected );
		}
	);
} );
