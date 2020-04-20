/**
 * External dependencies
 */
import { equal, ok } from 'assert';
import { groupBy, pickBy, forIn } from 'lodash';

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
} from '../phone-number';

describe( 'metadata:', () => {
	describe( 'data assertions:', () => {
		const countriesShareDialCode = pickBy(
			groupBy( Object.values( countries ), 'dialCode' ),
			( val ) => val.length > 1
		);

		describe( 'countries sharing dial code should have priority data', () => {
			forIn( countriesShareDialCode, ( countriesWithDialCode, dialCode ) => {
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
