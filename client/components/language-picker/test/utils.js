/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getLanguageGroupById,
	getLanguageGroupFromTerritoryId,
	getLanguageGroupByCountryCode,
} from '../utils';
import { LANGUAGE_GROUPS, DEFAULT_LANGUAGE_GROUP } from '../constants';

describe( 'language picker utils', () => {
	describe( 'getLanguageGroupById()', () => {
		test( 'should return expected territory', () => {
			expect( getLanguageGroupById( 'eastern-europe' ) ).to.eql( LANGUAGE_GROUPS[ 4 ] );
		} );
		test( 'should return detault territory slug', () => {
			expect( getLanguageGroupById( 'sad' ) ).to.be.undefined;
		} );
	} );

	describe( 'getLanguageGroupFromTerritoryId()', () => {
		test( 'should return expected language group id for territory id `002`', () => {
			expect( getLanguageGroupFromTerritoryId( '002' ) ).to.eql( 'africa-middle-east' );
		} );
		test( 'should return expected language group id for territory id `019`', () => {
			expect( getLanguageGroupFromTerritoryId( '019' ) ).to.eql( 'americas' );
		} );
		test( 'should return default language group id', () => {
			expect( getLanguageGroupFromTerritoryId( '000' ) ).to.eql( DEFAULT_LANGUAGE_GROUP );
		} );
	} );

	describe( 'getLanguageGroupByCountryCode()', () => {
		test( 'should return expected language group id for Australia', () => {
			expect( getLanguageGroupByCountryCode( 'AU' ) ).to.equal( 'asia-pacific' );
		} );
		test( 'should return expected language group id for Italy', () => {
			expect( getLanguageGroupByCountryCode( 'PL' ) ).to.equal( 'eastern-europe' );
		} );
		test( 'should return expected language group id for South Africa', () => {
			expect( getLanguageGroupByCountryCode( 'SA' ) ).to.equal( 'africa-middle-east' );
		} );
		test( 'should return expected language group id for Mexico', () => {
			expect( getLanguageGroupByCountryCode( 'MX' ) ).to.equal( 'americas' );
		} );
		test( 'should return default language group id', () => {
			expect( getLanguageGroupByCountryCode( 'OOPS' ) ).to.equal( DEFAULT_LANGUAGE_GROUP );
		} );
	} );
} );
