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
	name: 'Twenty Something',
	author: 'the WordPress team',
	screenshot: 'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysomething/screenshot.png',
	screenshots: [ 'https://i0.wp.com/theme.files.wordpress.com/2015/12/twentysomething-featured-image.jpg?ssl=1' ],
	stylesheet: 'pub/twentysomething',
	taxonomies: {
		theme_subject: [
			{
				name: 'Blog',
				slug: 'blog',
				term_id: '273'
			},
			{
				name: 'Lifestream',
				slug: 'lifestream',
				term_id: '652270'
			},
			{
				name: 'Journal',
				slug: 'journal',
				term_id: '96'
			}
		],
		theme_color: [
			{
				name: 'Black',
				slug: 'black',
				term_id: '59007'
			},
			{
				name: 'Blue',
				slug: 'blue',
				term_id: '9150'
			},
			{
				name: 'Gray',
				slug: 'gray',
				term_id: '147520'
			}
		]
	},
	demo_uri: 'https://twentysomethingdemo.wordpress.com/',
	descriptionLong: 'The annual WordPress theme for this year is a modern take on an ever-popular layout. ' +
		'The horizontal header area with an optional right sidebar works perfectly for both blogs <em>and</em> websites.',
	description: 'This is a modernized take on an ever-popular WordPress layout' +
		' — the horizontal masthead with an optional right sidebar that works perfectly for blogs and websites.'
};

describe( 'ThemeQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new ThemeQueryManager();
	} );

	describe( '#matches()', () => {
		context( 'query.search', () => {
			it( 'should return false for a non-matching search', () => {
				const isMatch = manager.matches( {
					search: 'nonexisting'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true for a matching title search', () => {
				const isMatch = manager.matches( {
					search: 'Twenty'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a falsey title search', () => {
				const isMatch = manager.matches( {
					search: null
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a matching content search', () => {
				const isMatch = manager.matches( {
					search: 'modern'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			it( 'should search case-insensitive', () => {
				const isMatch = manager.matches( {
					search: 'Sidebar'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			it( 'should separately test title and content fields', () => {
				const isMatch = manager.matches( {
					search: 'TwentyThe'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );

			// search terms
		} );

		context( 'query.filters', () => {
			it( 'should return false if theme does not include filter', () => {
				const isMatch = manager.matches( {
					filters: 'nosuchfilter'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false on a partial match', () => {
				const isMatch = manager.matches( {
					filters: 'ourna'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if theme includes filter', () => {
				const isMatch = manager.matches( {
					filters: 'journal'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			context( 'with multiple filters from a single taxonomy', () => {
				it( 'should return false if theme doesn\'t match all filters', () => {
					const isMatch = manager.matches( {
						filters: 'journal,business'
					}, DEFAULT_THEME );

					expect( isMatch ).to.be.false;
				} );
				it( 'should return true if theme matches all filters', () => {
					const isMatch = manager.matches( {
						filters: 'journal,blog'
					}, DEFAULT_THEME );

					expect( isMatch ).to.be.true;
				} );
			} );

			context( 'with multiple filters from different taxonomies', () => {
				it( 'should return false if theme doesn\'t match all filters', () => {
					const isMatch = manager.matches( {
						filters: 'journal,green'
					}, DEFAULT_THEME );

					expect( isMatch ).to.be.false;
				} );
				it( 'should return true if theme matches all filters', () => {
					const isMatch = manager.matches( {
						filters: 'journal,black'
					}, DEFAULT_THEME );

					expect( isMatch ).to.be.true;
				} );
			} );
		} );

		context( 'query.tier', () => {
			it( 'should return true for a free theme when querying for all themes', () => {
				const isMatch = manager.matches( {
					tier: ''
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a free theme when querying for free themes', () => {
				const isMatch = manager.matches( {
					tier: 'free'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false for a free theme when querying for premium themes', () => {
				const isMatch = manager.matches( {
					tier: 'premium'
				}, DEFAULT_THEME );

				expect( isMatch ).to.be.false;
			} );
		} );
	} );
} );
