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
	getLanguageGroupByLangSlug,
} from '../utils';
import { LANGUAGE_GROUPS, DEFAULT_LANGUAGE_GROUP } from '../constants';

describe( 'language picker utils', () => {
	const languagesMock = [
		{
			value: 2,
			popular: 1,
			langSlug: 'af',
			name: 'Afrikaans',
			wpLocale: 'af',
			territories: [ '002' ],
		},
		{ value: 418, langSlug: 'als', name: 'Alemannisch', wpLocale: '', territories: [ '155' ] },
		{ value: 456, langSlug: 'ne', name: 'नेपाली', wpLocale: 'ne_NP', territories: [ '034' ] },
	];

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

	describe( 'getLanguageGroupByLangSlug()', () => {
		test( 'should return expected language group id for langSlug `als`', () => {
			expect( getLanguageGroupByLangSlug( 'als', languagesMock ) ).to.eql( 'western-europe' );
		} );
		test( 'should return expected language group id for langSlug `ne`', () => {
			expect( getLanguageGroupByLangSlug( 'ne', languagesMock ) ).to.eql( 'asia-pacific' );
		} );
		test( 'should return `popular`', () => {
			expect( getLanguageGroupByLangSlug( 'af', languagesMock, true ) ).to.eql( 'popular' );
		} );
		test( 'should not return `popular` if language is not popular', () => {
			expect( getLanguageGroupByLangSlug( 'als', languagesMock, true ) ).to.eql( 'western-europe' );
		} );
	} );
} );
