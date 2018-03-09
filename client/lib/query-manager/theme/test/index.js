/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ThemeQueryManager from '../';

/**
 * Constants
 */
const DEFAULT_THEME = {
	author: 'Automattic',
	id: 'dara',
	stylesheet: 'pub/dara',
	name: 'Dara',
	taxonomies: {
		theme_subject: [
			{ name: 'Blog', slug: 'blog', term_id: '273' },
			{ name: 'Business', slug: 'business', term_id: '179' },
		],
		theme_style: [
			{ name: 'Bright', slug: 'bright', term_id: '130006' },
			{ name: 'Modern', slug: 'modern', term_id: '4690' },
			{ name: 'Professional', slug: 'professional', term_id: '7830' },
		],
	},
	cost: { currency: 'EUR', number: 0, display: '' },
	version: '1.2.1',
	download_url: 'https://public-api.wordpress.com/rest/v1/themes/download/dara.zip',
	trending_rank: 6,
	popularity_rank: 10,
	launch_date: '2017-01-30',
	theme_uri: 'http://wordpress.com/themes/dara/',
	description:
		'With bold featured images and bright, cheerful colors, Dara is ready to get to work for your business.',
	preview_url: 'http://demiantest.com/?theme=pub/dara&hide_banners=true',
};

describe( 'ThemeQueryManager', () => {
	describe( '#matches()', () => {
		describe( 'query.search', () => {
			test( 'should return false for a non-matching search', () => {
				const isMatch = ThemeQueryManager.matches( { search: 'Cars' }, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );

			test( 'should return true for an empty search', () => {
				const isMatch = ThemeQueryManager.matches( { search: '' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching title search', () => {
				const isMatch = ThemeQueryManager.matches( { search: 'Dara' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			test( 'should search case-insensitive', () => {
				const isMatch = ThemeQueryManager.matches( { search: 'dArA' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );
		} );

		describe( 'query.filter', () => {
			test( 'should return true for an empty filter', () => {
				const isMatch = ThemeQueryManager.matches( { filter: '' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for single matching filter', () => {
				const isMatch = ThemeQueryManager.matches( { filter: 'blog' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for multiple matching filters', () => {
				const isMatch = ThemeQueryManager.matches( { filter: 'blog+modern' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			test( 'should return false for single non matching filter', () => {
				const isMatch = ThemeQueryManager.matches( { filter: 'blogs' }, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );

			test( 'should return false for multiple non matching filters', () => {
				const isMatch = ThemeQueryManager.matches( { filter: 'blogs+moderns' }, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );

			test( 'should return false for partial non matching filters', () => {
				const isMatch = ThemeQueryManager.matches( { filter: 'blog+moderns' }, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );
		} );

		describe( 'query.tier', () => {
			test( 'should return true if tier is empty', () => {
				const isMatch = ThemeQueryManager.matches( { tier: '' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true if tier matches', () => {
				const isMatch = ThemeQueryManager.matches( { tier: 'free' }, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			test( 'should return false if tier doesnt match', () => {
				const isMatch = ThemeQueryManager.matches( { tier: 'premium' }, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );
		} );
	} );

	describe( '#sort()', () => {
		test( 'should leave key order unchanged', () => {
			const originalKeys = Object.freeze( [
				'adaline',
				'fanwood-light',
				'ixion',
				'cols',
				'timepiece',
				'chalkboard',
				'handmade',
				'trvl',
				'dyad',
				'little-story',
				'pachyderm',
			] );
			const keys = [ ...originalKeys ];

			ThemeQueryManager.sort( keys );
			expect( keys ).to.deep.equal( originalKeys );
		} );
	} );
} );
