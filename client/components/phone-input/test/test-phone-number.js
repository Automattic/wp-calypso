/**
 * External dependencies
 */
import { equal, ok } from 'assert';
import { groupBy, pickBy, forIn } from 'lodash';

/**
 * Internal dependencies
 */
import {
	findCountryFromNumber,
	formatNumber,
	makeTemplate,
	findPattern,
	DIGIT_PLACEHOLDER,
	applyTemplate,
	toE164
} from '../phone-number';

import { countries } from '../data';

describe( 'metadata:', () => {
	describe( 'data assertions:', () => {
		const countriesShareDialCode = pickBy(
			groupBy( Object.values( countries ), 'dialCode' ),
			val => val.length > 1 );

		describe( 'countries sharing dial code should have priority data', () => {
			forIn( countriesShareDialCode, ( countriesWithDialCode, dialCode ) => {
				describe( 'Dialcode: ' + dialCode, () => {
					countriesWithDialCode.forEach( country =>
						it( country.isoCode, () =>
							ok( country.priority, `"${ country.isoCode }" has no priority` ) ) );
				} );
			} );
		} );
	} );

	describe( 'findPattern( number, patterns )', () => {
		it( 'should be able to find a pattern', () => {
			ok( findPattern( '4259999999', countries.us.patterns ) );
		} );
	} );

	describe( 'makeTemplate( pattern )', () => {
		it( 'should be able to make templates', () => {
			equal( makeTemplate( '4259999999', countries.us.patterns ), '(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ) );
			equal( makeTemplate( '4259999', countries.us.patterns ), '...-....'.replace( /\./g, DIGIT_PLACEHOLDER ) );
		} );
	} );

	describe( 'applyTemplate( number, template, positionTracking )', () => {
		it( 'should be able to apply basic templates', () => {
			equal( applyTemplate( '4259999999', '(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ) ), '(425) 999-9999' );
		} );

		it( 'should be able to partially apply templates', () => {
			equal( applyTemplate( '4259', '...-....'.replace( /\./g, DIGIT_PLACEHOLDER ) ), '425-9' );
		} );

		it( 'should be able to track the position of the cursor', () => {
			// 425|9999999 -> pos: 3
			const positionTracking = { pos: 3 };
			applyTemplate( '4259999999', '(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ), positionTracking );
			equal( positionTracking.pos, 6 );

			positionTracking.pos = 1;
			applyTemplate( '4259999999', '(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ), positionTracking );
			equal( positionTracking.pos, 2 );

			positionTracking.pos = 4;
			applyTemplate( '4259999999', '(...) ...-....'.replace( /\./g, DIGIT_PLACEHOLDER ), positionTracking );
			equal( positionTracking.pos, 7 );
		} );
	} );

	describe( 'findCountryFromNumber( number )', () => {
		it( 'should guess a dial code with explicit dial code', () => {
			equal( findCountryFromNumber( '+90' ).isoCode, 'tr' );
			equal( findCountryFromNumber( '0090' ).isoCode, 'tr' );
		} );

		it( 'should guess a shared dial code with area code', () => {
			equal( findCountryFromNumber( '+1604' ).isoCode, 'ca', 'Failed to figure out Canadian' );
			equal( findCountryFromNumber( '+1425' ).isoCode, 'us', 'Failed to figure out U.S.' );
			equal( findCountryFromNumber( '+14' ).isoCode, 'us', 'Failed to figure out U.S.' );
		} );

		it( 'should guess a country as soon as possible', () => {
			equal( findCountryFromNumber( '+1' ).isoCode, 'us' );
			equal( findCountryFromNumber( '+14' ).isoCode, 'us' );
			equal( findCountryFromNumber( '+142' ).isoCode, 'us' );
			equal( findCountryFromNumber( '+1425' ).isoCode, 'us' );

			equal( findCountryFromNumber( '+1' ).isoCode, 'us' );
			equal( findCountryFromNumber( '+16' ).isoCode, 'us' );
			equal( findCountryFromNumber( '+160' ).isoCode, 'us' );
			equal( findCountryFromNumber( '+1604' ).isoCode, 'ca' );
		} );

		it( 'should guess countries with full numbers', () => {
			equal( findCountryFromNumber( '+14255222222' ).isoCode, 'us' );
			equal( findCountryFromNumber( '+16043412222' ).isoCode, 'ca' );
			equal( findCountryFromNumber( '+905333239999' ).isoCode, 'tr' );
			equal( findCountryFromNumber( '+493033239999' ).isoCode, 'de' );
			equal( findCountryFromNumber( '+61215369851' ).isoCode, 'au' );
		} );
	} );

	describe( 'formatNumber', () => {
		describe( 'In international format', () => {
			it( 'should format full length numbers', () => {
				equal( formatNumber( '+14252222222', countries.us ), '+1 425-222-2222' );
				equal( formatNumber( '+905325555555', countries.tr ), '+90 532 555 55 55' );
			} );

			it( 'should format as you type', () => {
				equal( formatNumber( '+1', countries.us ), '+1' );
				equal( formatNumber( '+14', countries.us ), '+14' );
				equal( formatNumber( '+142', countries.us ), '+1 42' );
				equal( formatNumber( '+1425', countries.us ), '+1 425' );
				equal( formatNumber( '+14256', countries.us ), '+1 425-6' );
				equal( formatNumber( '+142565', countries.us ), '+1 425-65' );
				equal( formatNumber( '+1425655', countries.us ), '+1 425-655' );
				equal( formatNumber( '+14256559', countries.us ), '+1 425-655-9' );
				equal( formatNumber( '+142565599', countries.us ), '+1 425-655-99' );
				equal( formatNumber( '+1425655999', countries.us ), '+1 425-655-999' );
				equal( formatNumber( '+14256559999', countries.us ), '+1 425-655-9999' );

				equal( formatNumber( '+1', countries.ca ), '+1' );
				equal( formatNumber( '+16', countries.ca ), '+16' );
				equal( formatNumber( '+160', countries.ca ), '+1 60' );
				equal( formatNumber( '+1604', countries.ca ), '+1 604' );
				equal( formatNumber( '+16046', countries.ca ), '+1 604-6' );
				equal( formatNumber( '+160465', countries.ca ), '+1 604-65' );
				equal( formatNumber( '+1604655', countries.ca ), '+1 604-655' );
				equal( formatNumber( '+16046559', countries.ca ), '+1 604-655-9' );
				equal( formatNumber( '+160465599', countries.ca ), '+1 604-655-99' );
				equal( formatNumber( '+1604655999', countries.ca ), '+1 604-655-999' );
				equal( formatNumber( '+16046559999', countries.ca ), '+1 604-655-9999' );

				equal( formatNumber( '+90', countries.tr ), '+90' );
				equal( formatNumber( '+905', countries.tr ), '+90 5' );
				equal( formatNumber( '+9055', countries.tr ), '+90 55' );
				equal( formatNumber( '+90555', countries.tr ), '+90 555' );
				equal( formatNumber( '+905558', countries.tr ), '+90 555 8' );
				equal( formatNumber( '+9055588', countries.tr ), '+90 555 88' );
				equal( formatNumber( '+90555888', countries.tr ), '+90 555 888' );
				equal( formatNumber( '+905558889', countries.tr ), '+90 555 888 9' );
				equal( formatNumber( '+9055588899', countries.tr ), '+90 555 888 99' );
				equal( formatNumber( '+90555888999', countries.tr ), '+90 555 888 99 9' );
				equal( formatNumber( '+905558889999', countries.tr ), '+90 555 888 99 99' );
			} );
		} );

		describe( 'In national format', () => {
			it( 'should format full length numbers', () => {
				equal( formatNumber( '4252222222', countries.us ), '(425) 222-2222' );
				equal( formatNumber( '05325555555', countries.tr ), '0532 555 55 55' );
				equal( formatNumber( '0215369851', countries.au ), '02 1536 9851' );
			} );

			it( 'should format as you type', () => {
				equal( formatNumber( '4', countries.us ), '4' );
				equal( formatNumber( '42', countries.us ), '42' );
				equal( formatNumber( '425', countries.us ), '425' );
				equal( formatNumber( '4256', countries.us ), '425-6' );
				equal( formatNumber( '42565', countries.us ), '425-65' );
				equal( formatNumber( '425655', countries.us ), '425-655' );
				equal( formatNumber( '4256559', countries.us ), '425-6559' );
				equal( formatNumber( '42565599', countries.us ), '(425) 655-99' );
				equal( formatNumber( '425655999', countries.us ), '(425) 655-999' );
				equal( formatNumber( '4256559999', countries.us ), '(425) 655-9999' );

				equal( formatNumber( '6', countries.us ), '6' );
				equal( formatNumber( '60', countries.us ), '60' );
				equal( formatNumber( '604', countries.us ), '604' );
				equal( formatNumber( '6046', countries.us ), '604-6' );
				equal( formatNumber( '60465', countries.us ), '604-65' );
				equal( formatNumber( '604655', countries.us ), '604-655' );
				equal( formatNumber( '6046559', countries.us ), '604-6559' );
				equal( formatNumber( '60465599', countries.us ), '(604) 655-99' );
				equal( formatNumber( '604655999', countries.us ), '(604) 655-999' );
				equal( formatNumber( '6046559999', countries.us ), '(604) 655-9999' );
			} );

			it( 'should not add a prefix when the country does not have national prefix', () => {
				equal( formatNumber( '9876543210', countries.is ), '9876543210' );
				equal( formatNumber( '+96', countries.iq ), '+96' );
				equal( formatNumber( '+126', countries.ag ), '+126' );
			} );
		} );

		describe( 'NANPA', () => {
			it( 'should format full length numbers', () => {
				equal( formatNumber( '14252222222', countries.us ), '1 425-222-2222' );
			} );
			it( 'should format as you type', () => {
				equal( formatNumber( '14', countries.us ), '14' );
				equal( formatNumber( '142', countries.us ), '1 42' );
				equal( formatNumber( '1425', countries.us ), '1 425' );
				equal( formatNumber( '14256', countries.us ), '1 425-6' );
				equal( formatNumber( '142565', countries.us ), '1 425-65' );
				equal( formatNumber( '1425655', countries.us ), '1 425-655' );
				equal( formatNumber( '14256559', countries.us ), '1 425-655-9' );
				equal( formatNumber( '142565599', countries.us ), '1 425-655-99' );
				equal( formatNumber( '1425655999', countries.us ), '1 425-655-999' );
				equal( formatNumber( '14256559999', countries.us ), '1 425-655-9999' );
			} );
		} );

		describe( 'sanitization', () => {
			it( 'should strip non-digits on <3 length strings', () => {
				equal( formatNumber( '1aaaa', countries.us ), '1' );
				equal( formatNumber( '1a', countries.us ), '1' );
			} );
		} );
	} );

	describe( 'toE164', () => {
		describe( 'from national formats', () => {
			it( 'should be able to handle NANPA', () => {
				equal( toE164( '14256559999', countries.us ), '+14256559999' );
				equal( toE164( '4256559999', countries.us ), '+14256559999' );
			} );
			it( 'should be able to handle Europe', () => {
				equal( toE164( '05325556677', countries.tr ), '+905325556677' );
				equal( toE164( '01234567890', countries.gb ), '+441234567890' );
				equal( toE164( '012345678', countries.it ), '+39012345678' );
			} );
		} );
	} );
} );

