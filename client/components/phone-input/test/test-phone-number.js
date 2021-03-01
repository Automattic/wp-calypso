/**
 * External dependencies
 */
import { equal, ok, deepStrictEqual } from 'assert';
import { groupBy, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { countries } from '../data';
import {
	findCountryFromNumber,
	formatNumber,
	makeTemplate,
	findPattern,
	toIcannFormat,
	DIGIT_PLACEHOLDER,
	applyTemplate,
	toE164,
	indexOfLongestCommonSuffix,
	indexOfStrictSubsequenceEnd,
	nonDigitsAtStart,
	numDigitsBeforeIndex,
	getUpdatedCursorPosition,
} from '../phone-number';

describe( 'metadata:', () => {
	describe( 'data assertions:', () => {
		const countriesShareDialCode = pickBy(
			groupBy( Object.values( countries ), 'dialCode' ),
			( val ) => val.length > 1
		);

		describe( 'countries sharing dial code should have priority data', () => {
			Object.entries( countriesShareDialCode ).map( ( [ dialCode, countriesWithDialCode ] ) => {
				describe( 'Dialcode: ' + dialCode, () => {
					countriesWithDialCode.forEach( ( country ) =>
						test( country.isoCode, () =>
							ok( country.priority, `"${ country.isoCode }" has no priority` )
						)
					);
				} );
			} );
		} );
	} );

	describe( 'findPattern( number, patterns )', () => {
		test( 'should be able to find a pattern', () => {
			ok( findPattern( '4259999999', countries.US.patterns ) );
		} );
	} );

	describe( 'makeTemplate( pattern )', () => {
		test( 'should be able to make templates', () => {
			equal(
				makeTemplate( '4259999999', countries.US.patterns ),
				'(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER )
			);
			equal(
				makeTemplate( '4259999', countries.US.patterns ),
				'...-....'.replace( /\./g, DIGIT_PLACEHOLDER )
			);
		} );
	} );

	describe( 'applyTemplate( number, template, positionTracking )', () => {
		test( 'should be able to apply basic templates', () => {
			equal(
				applyTemplate( '4259999999', '(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ) ),
				'(425) 999-9999'
			);
		} );

		test( 'should be able to partially apply templates', () => {
			equal( applyTemplate( '4259', '...-....'.replace( /\./g, DIGIT_PLACEHOLDER ) ), '425-9' );
		} );

		test( 'should be able to track the position of the cursor', () => {
			// 425|9999999 -> pos: 3
			const positionTracking = { pos: 3 };
			applyTemplate(
				'4259999999',
				'(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ),
				positionTracking
			);
			equal( positionTracking.pos, 6 );

			positionTracking.pos = 1;
			applyTemplate(
				'4259999999',
				'(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ),
				positionTracking
			);
			equal( positionTracking.pos, 2 );

			positionTracking.pos = 4;
			applyTemplate(
				'4259999999',
				'(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ),
				positionTracking
			);
			equal( positionTracking.pos, 7 );
		} );
	} );

	describe( 'findCountryFromNumber( number )', () => {
		test( 'should guess a dial code with explicit dial code', () => {
			equal( findCountryFromNumber( '+90' ).isoCode, 'TR' );
			equal( findCountryFromNumber( '0090' ).isoCode, 'TR' );
		} );

		test( 'should guess a shared dial code with area code', () => {
			equal( findCountryFromNumber( '+1604' ).isoCode, 'CA', 'Failed to figure out Canadian' );
			equal( findCountryFromNumber( '+1425' ).isoCode, 'US', 'Failed to figure out U.S.' );
			equal( findCountryFromNumber( '+14' ).isoCode, 'US', 'Failed to figure out U.S.' );
		} );

		test( 'should guess a country as soon as possible', () => {
			equal( findCountryFromNumber( '+1' ).isoCode, 'US' );
			equal( findCountryFromNumber( '+14' ).isoCode, 'US' );
			equal( findCountryFromNumber( '+142' ).isoCode, 'US' );
			equal( findCountryFromNumber( '+1425' ).isoCode, 'US' );

			equal( findCountryFromNumber( '+1' ).isoCode, 'US' );
			equal( findCountryFromNumber( '+16' ).isoCode, 'US' );
			equal( findCountryFromNumber( '+160' ).isoCode, 'US' );
			equal( findCountryFromNumber( '+1604' ).isoCode, 'CA' );
		} );

		test( 'should guess countries with full numbers', () => {
			equal( findCountryFromNumber( '+14255222222' ).isoCode, 'US' );
			equal( findCountryFromNumber( '+16043412222' ).isoCode, 'CA' );
			equal( findCountryFromNumber( '+905333239999' ).isoCode, 'TR' );
			equal( findCountryFromNumber( '+493033239999' ).isoCode, 'DE' );
			equal( findCountryFromNumber( '+61215369851' ).isoCode, 'AU' );
		} );
	} );

	describe( 'formatNumber', () => {
		describe( 'In international format', () => {
			test( 'should format full length numbers', () => {
				equal( formatNumber( '+14252222222', countries.US ), '+1 425-222-2222' );
				equal( formatNumber( '+905325555555', countries.TR ), '+90 532 555 55 55' );
			} );

			test( 'should format as you type', () => {
				equal( formatNumber( '+1', countries.US ), '+1' );
				equal( formatNumber( '+14', countries.US ), '+14' );
				equal( formatNumber( '+142', countries.US ), '+1 42' );
				equal( formatNumber( '+1425', countries.US ), '+1 425' );
				equal( formatNumber( '+14256', countries.US ), '+1 425-6' );
				equal( formatNumber( '+142565', countries.US ), '+1 425-65' );
				equal( formatNumber( '+1425655', countries.US ), '+1 425-655' );
				equal( formatNumber( '+14256559', countries.US ), '+1 425-655-9' );
				equal( formatNumber( '+142565599', countries.US ), '+1 425-655-99' );
				equal( formatNumber( '+1425655999', countries.US ), '+1 425-655-999' );
				equal( formatNumber( '+14256559999', countries.US ), '+1 425-655-9999' );

				equal( formatNumber( '+1', countries.CA ), '+1' );
				equal( formatNumber( '+16', countries.CA ), '+16' );
				equal( formatNumber( '+160', countries.CA ), '+1 60' );
				equal( formatNumber( '+1604', countries.CA ), '+1 604' );
				equal( formatNumber( '+16046', countries.CA ), '+1 604-6' );
				equal( formatNumber( '+160465', countries.CA ), '+1 604-65' );
				equal( formatNumber( '+1604655', countries.CA ), '+1 604-655' );
				equal( formatNumber( '+16046559', countries.CA ), '+1 604-655-9' );
				equal( formatNumber( '+160465599', countries.CA ), '+1 604-655-99' );
				equal( formatNumber( '+1604655999', countries.CA ), '+1 604-655-999' );
				equal( formatNumber( '+16046559999', countries.CA ), '+1 604-655-9999' );

				equal( formatNumber( '+90', countries.TR ), '+90' );
				equal( formatNumber( '+905', countries.TR ), '+90 5' );
				equal( formatNumber( '+9055', countries.TR ), '+90 55' );
				equal( formatNumber( '+90555', countries.TR ), '+90 555' );
				equal( formatNumber( '+905558', countries.TR ), '+90 555 8' );
				equal( formatNumber( '+9055588', countries.TR ), '+90 555 88' );
				equal( formatNumber( '+90555888', countries.TR ), '+90 555 888' );
				equal( formatNumber( '+905558889', countries.TR ), '+90 555 888 9' );
				equal( formatNumber( '+9055588899', countries.TR ), '+90 555 888 99' );
				equal( formatNumber( '+90555888999', countries.TR ), '+90 555 888 99 9' );
				equal( formatNumber( '+905558889999', countries.TR ), '+90 555 888 99 99' );
			} );
		} );

		describe( 'In national format', () => {
			test( 'should format full length numbers', () => {
				equal( formatNumber( '4252222222', countries.US ), '(425) 222-2222' );
				equal( formatNumber( '05325555555', countries.TR ), '0532 555 55 55' );
				equal( formatNumber( '0215369851', countries.AU ), '02 1536 9851' );
			} );

			test( 'should format as you type', () => {
				equal( formatNumber( '4', countries.US ), '4' );
				equal( formatNumber( '42', countries.US ), '42' );
				equal( formatNumber( '425', countries.US ), '425' );
				equal( formatNumber( '4256', countries.US ), '425-6' );
				equal( formatNumber( '42565', countries.US ), '425-65' );
				equal( formatNumber( '425655', countries.US ), '425-655' );
				equal( formatNumber( '4256559', countries.US ), '425-6559' );
				equal( formatNumber( '42565599', countries.US ), '(425) 655-99' );
				equal( formatNumber( '425655999', countries.US ), '(425) 655-999' );
				equal( formatNumber( '4256559999', countries.US ), '(425) 655-9999' );

				equal( formatNumber( '6', countries.US ), '6' );
				equal( formatNumber( '60', countries.US ), '60' );
				equal( formatNumber( '604', countries.US ), '604' );
				equal( formatNumber( '6046', countries.US ), '604-6' );
				equal( formatNumber( '60465', countries.US ), '604-65' );
				equal( formatNumber( '604655', countries.US ), '604-655' );
				equal( formatNumber( '6046559', countries.US ), '604-6559' );
				equal( formatNumber( '60465599', countries.US ), '(604) 655-99' );
				equal( formatNumber( '604655999', countries.US ), '(604) 655-999' );
				equal( formatNumber( '6046559999', countries.US ), '(604) 655-9999' );
			} );

			test( 'should not add a prefix when the country does not have national prefix', () => {
				equal( formatNumber( '9876543210', countries.IS ), '9876543210' );
				equal( formatNumber( '+96', countries.IQ ), '+96' );
				equal( formatNumber( '+126', countries.AG ), '+126' );
			} );
		} );

		describe( 'NANPA', () => {
			test( 'should format full length numbers', () => {
				equal( formatNumber( '14252222222', countries.US ), '1 425-222-2222' );
			} );
			test( 'should format as you type', () => {
				equal( formatNumber( '14', countries.US ), '14' );
				equal( formatNumber( '142', countries.US ), '1 42' );
				equal( formatNumber( '1425', countries.US ), '1 425' );
				equal( formatNumber( '14256', countries.US ), '1 425-6' );
				equal( formatNumber( '142565', countries.US ), '1 425-65' );
				equal( formatNumber( '1425655', countries.US ), '1 425-655' );
				equal( formatNumber( '14256559', countries.US ), '1 425-655-9' );
				equal( formatNumber( '142565599', countries.US ), '1 425-655-99' );
				equal( formatNumber( '1425655999', countries.US ), '1 425-655-999' );
				equal( formatNumber( '14256559999', countries.US ), '1 425-655-9999' );
			} );
		} );

		describe( 'sanitization', () => {
			test( 'should strip non-digits on <3 length strings', () => {
				equal( formatNumber( '1aaaa', countries.US ), '1' );
				equal( formatNumber( '1a', countries.US ), '1' );
			} );
		} );
	} );

	describe( 'toE164', () => {
		describe( 'from national formats', () => {
			test( 'should be able to handle NANPA', () => {
				equal( toE164( '14256559999', countries.US ), '+14256559999' );
				equal( toE164( '4256559999', countries.US ), '+14256559999' );
			} );
			test( 'should be able to handle Europe', () => {
				equal( toE164( '05325556677', countries.TR ), '+905325556677' );
				equal( toE164( '01234567890', countries.GB ), '+441234567890' );
				equal( toE164( '012345678', countries.IT ), '+39012345678' );
			} );
		} );
	} );

	describe( 'toIcannFormat', () => {
		test( 'should be able to handle NANPA', () => {
			equal( toIcannFormat( '14256559999', countries.US ), '+1.4256559999' );
			equal( toIcannFormat( '4256559999', countries.US ), '+1.4256559999' );
		} );
		test( 'should be able to handle Europe', () => {
			equal( toIcannFormat( '05325556677', countries.TR ), '+90.5325556677' );
			equal( toIcannFormat( '01234567890', countries.GB ), '+44.1234567890' );
			equal( toIcannFormat( '012345678', countries.IT ), '+39.012345678' );
		} );
		test( 'should separate country codes properly for countries with +1 and a separate leading digit', () => {
			equal( toIcannFormat( '+18686559999', countries.TT ), '+1.8686559999' );
		} );
	} );
} );

describe( 'indexOfLongestCommonSuffix', () => {
	test( 'if array1 === array2 === []', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [], [] ), [ 0, 0 ] );
	} );

	test( 'if array1 === ["a"] and array2 === []', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [ 'a' ], [] ), [ 1, 0 ] );
	} );

	test( 'if array1 === [] and array2 === ["a"]', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [], [ 'a' ] ), [ 0, 1 ] );
	} );

	test( 'if array1 === array2 === ["a"]', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [ 'a' ], [ 'a' ] ), [ 0, 0 ] );
	} );

	test( 'if array1 === array2', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [ 'a', 'b', 'c' ], [ 'a', 'b', 'c' ] ), [ 0, 0 ] );
	} );

	test( 'if array1 is a proper prefix of array2', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [ 'a', 'b', 'c' ], [ 'a', 'b', 'c', 'd' ] ), [
			3,
			4,
		] );
	} );

	test( 'if array2 is a proper suffix of array1', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [ 'a', 'b', 'c' ], [ 'b', 'c' ] ), [ 1, 0 ] );
	} );

	test( 'if longest common suffix of array1 and array2 is empty', () => {
		deepStrictEqual( indexOfLongestCommonSuffix( [ 'x', 'y', 'z' ], [ 'a', 'b', 'c', 'd' ] ), [
			3,
			4,
		] );
	} );
} );

describe( 'indexOfStrictSubsequenceEnd', () => {
	test( 'proper contiguous subsequence', () => {
		equal( indexOfStrictSubsequenceEnd( [ 'a', 'b' ], [ 'a', 'b', 'c' ] )[ 0 ], 2 );
	} );

	test( 'proper noncontiguous subsequence', () => {
		equal( indexOfStrictSubsequenceEnd( [ 'a', 'b' ], [ 'a', 'd', 'b', 'c' ] )[ 0 ], 3 );
	} );
} );

describe( 'nonDigitsAtStart', () => {
	test( 'if all digits, then return 0', () => {
		equal( nonDigitsAtStart( [ '1', '2', '3' ] ), 0 );
	} );

	test( 'if all nondigits, then return length', () => {
		equal( nonDigitsAtStart( [ 'x', 'y', 'z' ] ), 3 );
	} );

	test( 'nondigits followed by digits', () => {
		equal( nonDigitsAtStart( [ 'x', 'y', '7' ] ), 2 );
	} );

	test( 'nondigits followed by digits followed by nondigits', () => {
		equal( nonDigitsAtStart( [ 'x', 'y', '7', 'z' ] ), 2 );
	} );
} );

describe( 'numDigitsBeforeIndex', () => {
	test( 'empty array', () => {
		equal( numDigitsBeforeIndex( [], 1 ), 0 );
	} );

	test( 'all digits, index < length', () => {
		equal( numDigitsBeforeIndex( [ '1', '2', '3', '4' ], 3 ), 3 );
	} );

	test( 'all digits, index == length', () => {
		equal( numDigitsBeforeIndex( [ '1', '2', '3', '4' ], 4 ), 4 );
	} );

	test( 'all digits, index > length', () => {
		equal( numDigitsBeforeIndex( [ '1', '2', '3', '4' ], 5 ), 4 );
	} );

	test( 'not all digits, index < length', () => {
		equal( numDigitsBeforeIndex( [ '1', 'x', '3', '4' ], 3 ), 2 );
	} );

	test( 'not all digits, index == length', () => {
		equal( numDigitsBeforeIndex( [ '1', 'x', '3', '4' ], 4 ), 3 );
	} );

	test( 'not all digits, index > length', () => {
		equal( numDigitsBeforeIndex( [ '1', 'x', '3', '4' ], 5 ), 3 );
	} );

	test( 'no digits, index < length', () => {
		equal( numDigitsBeforeIndex( [ 'x', 'y', 'z', 'w' ], 3 ), 0 );
	} );

	test( 'no digits, index == length', () => {
		equal( numDigitsBeforeIndex( [ 'x', 'y', 'z', 'w' ], 4 ), 0 );
	} );

	test( 'no digits, index > length', () => {
		equal( numDigitsBeforeIndex( [ 'x', 'y', 'z', 'w' ], 5 ), 0 );
	} );
} );

describe( 'getUpdatedCursorPosition', () => {
	test( 'should return position after plus if appending only plus', () => {
		equal( getUpdatedCursorPosition( '', '+', 1 ), 1 );
	} );

	test( 'should return position after plus if deleting to only plus', () => {
		equal( getUpdatedCursorPosition( '+5', '+', 2 ), 1 );
	} );

	test( 'should return position after plus if replacing to only plus', () => {
		equal( getUpdatedCursorPosition( '555', '+', 3 ), 1 );
	} );

	test( 'should return last position for appending without special characters', () => {
		equal( getUpdatedCursorPosition( '23', '234', 2 ), 3 );
	} );

	test( 'should return last position for appending with special characters', () => {
		equal( getUpdatedCursorPosition( '234', '234-5', 3 ), 5 );
	} );

	test( 'should return last position for appending duplicate numbers with special characters', () => {
		equal( getUpdatedCursorPosition( '223-2', '223-22', 5 ), 6 );
	} );

	test( 'should return last position for appending duplicate substrings with special characters', () => {
		equal( getUpdatedCursorPosition( '223-2', '223-232', 5 ), 7 );
	} );

	test( 'should return last position for inserting duplicate numbers with special characters', () => {
		equal( getUpdatedCursorPosition( '223-2', '223-22', 4 ), 5 );
	} );

	test( 'should return last position for inserting duplicate numbers with special characters (2)', () => {
		equal( getUpdatedCursorPosition( '223-2', '223-22', 3 ), 5 );
	} );

	test( 'should return last position for appending duplicate numbers with special characters - interior', () => {
		equal( getUpdatedCursorPosition( '223-25', '223-225', 5 ), 6 );
	} );

	test( 'should return last position for appending duplicate substrings with special characters - interior', () => {
		equal( getUpdatedCursorPosition( '223-25', '223-2325', 5 ), 7 );
	} );

	test( 'should return last position for inserting duplicate numbers with special characters - interior', () => {
		equal( getUpdatedCursorPosition( '223-25', '223-225', 4 ), 5 );
	} );

	test( 'should return last position for inserting duplicate numbers with special characters (2) - interior', () => {
		equal( getUpdatedCursorPosition( '223-25', '223-225', 3 ), 5 );
	} );

	test( 'should return last position for deleting from end with special characters', () => {
		equal( getUpdatedCursorPosition( '234-5', '234', 5 ), 3 );
	} );

	test( 'should return last position for appending with initial plus', () => {
		equal( getUpdatedCursorPosition( '+1 234', '+1 234-5', 6 ), 8 );
	} );

	test( 'should return last position for appending with initial parenthesis', () => {
		equal( getUpdatedCursorPosition( '(802) 234', '(802) 234-5', 9 ), 11 );
	} );

	test( 'should return last position for appending when initial parenthesis are added', () => {
		equal( getUpdatedCursorPosition( '802-2343', '(802) 234-39', 8 ), 12 );
	} );

	test( 'should return last position for deleting when initial parenthesis are removed', () => {
		equal( getUpdatedCursorPosition( '(802) 234-39', '802-2343', 12 ), 8 );
	} );

	test( 'should return last position for deleting in between special characters', () => {
		equal( getUpdatedCursorPosition( '(802) 234-3943', '(802) 233-943', 9 ), 8 );
	} );

	test( 'should return last position for deleting multiple characters in between special characters', () => {
		equal( getUpdatedCursorPosition( '(802) 687-6234', '802-6234', 6 ), 3 );
	} );

	test( 'should return last position for replacing multiple characters in between special characters', () => {
		equal( getUpdatedCursorPosition( '(802) 687-6234', '(802) 555-6234', 6 ), 9 );
	} );

	test( 'should return position after cursor for inserting without special characters', () => {
		equal( getUpdatedCursorPosition( '124', '1234', 2 ), 3 );
	} );

	test( 'should return position after cursor for inserting before special characters', () => {
		equal( getUpdatedCursorPosition( '124', '123-4', 2 ), 3 );
	} );

	test( 'should return position after cursor for inserting multiple numbers before special characters', () => {
		equal( getUpdatedCursorPosition( '224', '223-764', 2 ), 6 );
	} );

	test( 'should return position after cursor for inserting after special characters', () => {
		equal( getUpdatedCursorPosition( '124-4', '124-64', 4 ), 5 );
	} );

	test( 'should return position after cursor for inserting after parenthesis before hyphen', () => {
		equal( getUpdatedCursorPosition( '(802) 614-21', '(802) 619-421', 8 ), 9 );
	} );

	test( 'should return last position when replacing characters with parenthesis', () => {
		equal( getUpdatedCursorPosition( '(802) 222-2222', '6', 14 ), 1 );
	} );

	test( 'should return last position when replacing characters with a plus', () => {
		equal( getUpdatedCursorPosition( '+1 802 222-2222', '6', 15 ), 1 );
	} );
} );
