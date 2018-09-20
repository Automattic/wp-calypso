/** @format */

/**
 * Internal dependencies
 */
import {
	getLanguageGroupById,
	getLanguageGroupFromTerritoryId,
	getLanguageGroupByCountryCode,
	getLanguageCodeLabels,
} from '../utils';
import { LANGUAGE_GROUPS, DEFAULT_LANGUAGE_GROUP } from '../constants';

describe( 'language picker utils', () => {
	describe( 'getLanguageGroupById()', () => {
		test( 'should return expected territory', () => {
			expect( getLanguageGroupById( 'eastern-europe' ) ).toBe( LANGUAGE_GROUPS[ 4 ] );
		} );
		test( 'should return detault territory slug', () => {
			expect( getLanguageGroupById( 'sad' ) ).toBeUndefined();
		} );
	} );

	describe( 'getLanguageGroupFromTerritoryId()', () => {
		test( 'should return expected language group id for territory id `002`', () => {
			expect( getLanguageGroupFromTerritoryId( '002' ) ).toBe( 'africa-middle-east' );
		} );
		test( 'should return expected language group id for territory id `019`', () => {
			expect( getLanguageGroupFromTerritoryId( '019' ) ).toBe( 'americas' );
		} );
		test( 'should return default language group id', () => {
			expect( getLanguageGroupFromTerritoryId( '000' ) ).toBe( DEFAULT_LANGUAGE_GROUP );
		} );
	} );

	describe( 'getLanguageGroupByCountryCode()', () => {
		test( 'should return expected language group id for Australia', () => {
			expect( getLanguageGroupByCountryCode( 'AU' ) ).toBe( 'asia-pacific' );
		} );
		test( 'should return expected language group id for Italy', () => {
			expect( getLanguageGroupByCountryCode( 'PL' ) ).toBe( 'eastern-europe' );
		} );
		test( 'should return expected language group id for South Africa', () => {
			expect( getLanguageGroupByCountryCode( 'SA' ) ).toBe( 'africa-middle-east' );
		} );
		test( 'should return expected language group id for Mexico', () => {
			expect( getLanguageGroupByCountryCode( 'MX' ) ).toBe( 'americas' );
		} );
		test( 'should return default language group id', () => {
			expect( getLanguageGroupByCountryCode( 'OOPS' ) ).toBe( DEFAULT_LANGUAGE_GROUP );
		} );
	} );
	describe( 'getLanguageCodeLabels()', () => {
		test( 'should return empty object if no lang slug passed ', () => {
			expect( getLanguageCodeLabels() ).toEqual( {} );
		} );
		test( 'should return lang code from xx', () => {
			expect( getLanguageCodeLabels( 'xx' ) ).toEqual( {
				langCode: 'xx',
			} );
		} );
		test( 'should return lang and lang sub code from xx-yy', () => {
			expect( getLanguageCodeLabels( 'xx-yy' ) ).toEqual( {
				langCode: 'xx',
				langSubcode: 'yy',
			} );
		} );
		test( 'should return lang code from xx_variant', () => {
			expect( getLanguageCodeLabels( 'xx_variant' ) ).toEqual( {
				langCode: 'xx',
			} );
		} );
		test( 'should return lang code from xx-yy_variant', () => {
			expect( getLanguageCodeLabels( 'xx-yy_variant' ) ).toEqual( {
				langCode: 'xx',
				langSubcode: 'yy',
			} );
		} );
	} );
} );
