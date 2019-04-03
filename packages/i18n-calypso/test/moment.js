/**
 * Internal dependencies
 */
import data from './data';
import i18n, { moment } from '../src';

describe( 'I18n', function() {
	beforeEach( function() {
		i18n.setLocale( data.locale );
	} );

	afterEach( function() {
		i18n.configure(); // ensure everything is reset
	} );

	describe( 'moment()', function() {
		describe( 'generating date strings', function() {
			it( 'should know the short weekdays', function() {
				expect( moment( '2014-07-18' ).format( 'dd' ) ).toBe( 'Fr' );
			} );
			it( 'should use available translations for date format', function() {
				expect(
					moment( '2014-07-18T14:59:09-07:00' )
						.utcOffset( '+00:00' )
						.format( 'LLLL' )
				).toBe( 'Freitag, 18. Juli 2014 21:59' );
			} );
			it( 'should use available translations for relative time in the past', function() {
				expect(
					moment()
						.subtract( 3, 'hours' )
						.fromNow()
				).toBe( 'vor 3 Stunden' );
			} );
			it( 'should use available translations for relative time in the future', function() {
				expect(
					moment()
						.add( 10, 'seconds' )
						.fromNow()
				).toBe( 'in ein paar Sekunden' );
			} );
		} );
	} );
} );
