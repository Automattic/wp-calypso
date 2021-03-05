/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isPremium,
	normalizeJetpackTheme,
	normalizeWpcomTheme,
	normalizeWporgTheme,
	getThemeIdFromStylesheet,
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
	getDeserializedThemesQueryDetails,
	getSerializedThemesQueryWithoutPage,
	isThemeMatchingQuery,
} from '../utils';

describe( 'utils', () => {
	describe( '#isPremium()', () => {
		test( 'given no theme object, should return false', () => {
			const premium = isPremium();
			expect( premium ).to.be.false;
		} );

		test( 'given a theme object with no stylesheet attr, should return false', () => {
			const premium = isPremium( {
				id: 'twentysixteen',
			} );
			expect( premium ).to.be.false;
		} );

		test( 'given a theme object with a stylesheet attr that doesn\'t start with "premium/", should return false', () => {
			const premium = isPremium( {
				id: 'twentysixteen',
				stylesheet: 'pub/twentysixteen',
			} );
			expect( premium ).to.be.false;
		} );

		test( 'given a theme object with a stylesheet attr that starts with "premium/", should return true', () => {
			const premium = isPremium( {
				id: 'mood',
				stylesheet: 'premium/mood',
			} );
			expect( premium ).to.be.true;
		} );
	} );

	describe( '#normalizeJetpackTheme()', () => {
		test( 'should return an empty object when given no argument', () => {
			const normalizedTheme = normalizeJetpackTheme();
			expect( normalizedTheme ).to.deep.equal( {} );
		} );
		test( 'should rename some keys', () => {
			const normalizedTheme = normalizeJetpackTheme( {
				id: 'twentyfifteen',
				name: 'Twenty Fifteen',
				author: 'the WordPress team',
				screenshot: 'twentyfifteen.png',
				download: 'http://downloads.wordpress.org/theme/twentyfifteen.1.7.zip',
				tags: [ 'custom-header', 'two-columns' ],
			} );
			expect( normalizedTheme ).to.deep.equal( {
				id: 'twentyfifteen',
				name: 'Twenty Fifteen',
				author: 'the WordPress team',
				screenshot: 'twentyfifteen.png',
				download: 'http://downloads.wordpress.org/theme/twentyfifteen.1.7.zip',
				taxonomies: {
					theme_feature: [ { slug: 'custom-header' }, { slug: 'two-columns' } ],
				},
			} );
		} );
	} );

	describe( '#normalizeWpcomTheme()', () => {
		test( 'should return an empty object when given no argument', () => {
			const normalizedTheme = normalizeWpcomTheme();
			expect( normalizedTheme ).to.deep.equal( {} );
		} );
		test( 'should rename some keys', () => {
			const normalizedTheme = normalizeWpcomTheme( {
				id: 'mood',
				name: 'Mood',
				author: 'Automattic',
				description: 'Mood is a business theme with positive vibe...',
				description_long: '<p>Say hello to <em>Mood</em>, a business theme with a positive vibe...',
				support_documentation:
					'<h2>Getting started</h2>↵<p>When you first activate <em>Mood</em>,...',
				screenshot: 'mood.jpg',
				price: '$20',
				stylesheet: 'premium/mood',
				demo_uri: 'https://mooddemo.wordpress.com/',
				author_uri: 'https://wordpress.com/themes/',
			} );
			expect( normalizedTheme ).to.deep.equal( {
				id: 'mood',
				name: 'Mood',
				author: 'Automattic',
				description: 'Mood is a business theme with positive vibe...',
				descriptionLong: '<p>Say hello to <em>Mood</em>, a business theme with a positive vibe...',
				supportDocumentation:
					'<h2>Getting started</h2>↵<p>When you first activate <em>Mood</em>,...',
				screenshot: 'mood.jpg',
				price: '$20',
				stylesheet: 'premium/mood',
				demo_uri: 'https://mooddemo.wordpress.com/',
				author_uri: 'https://wordpress.com/themes/',
			} );
		} );
	} );

	describe( '#normalizeWporgTheme()', () => {
		test( 'should return an empty object when given no argument', () => {
			const normalizedTheme = normalizeWporgTheme();
			expect( normalizedTheme ).to.deep.equal( {} );
		} );

		test( 'should rename some keys', () => {
			const normalizedTheme = normalizeWporgTheme( {
				slug: 'twentyfifteen',
				name: 'Twenty Fifteen',
				author: {
					user_nicename: 'wordpressdotorg',
					display_name: 'WordPress.org',
				},
				screenshot_url: '//ts.w.org/wp-content/themes/twentyfifteen/screenshot.png?ver=1.7',
				preview_url: 'https://wp-themes.com/twentyfifteen',
				download_link: 'http://downloads.wordpress.org/theme/twentyfifteen.1.7.zip',
				sections: {
					description:
						'Our 2015 default theme is clean, blog-focused, and designed for clarity. ...',
				},
				tags: {
					'custom-header': 'Custom Header',
					'two-columns': 'Two Columns',
				},
			} );
			expect( normalizedTheme ).to.deep.equal( {
				id: 'twentyfifteen',
				name: 'Twenty Fifteen',
				author: 'WordPress.org',
				screenshot: '//ts.w.org/wp-content/themes/twentyfifteen/screenshot.png?ver=1.7',
				demo_uri: 'https://wp-themes.com/twentyfifteen',
				download: 'http://downloads.wordpress.org/theme/twentyfifteen.1.7.zip',
				description: 'Our 2015 default theme is clean, blog-focused, and designed for clarity. ...',
				taxonomies: {
					theme_feature: [
						{ slug: 'custom-header', name: 'Custom Header' },
						{ slug: 'two-columns', name: 'Two Columns' },
					],
				},
			} );
		} );
	} );

	describe( '#getThemeIdFromStylesheet()', () => {
		test( 'should return undefined when given no argument', () => {
			const themeId = getThemeIdFromStylesheet();
			expect( themeId ).to.be.undefined;
		} );

		test( "should return the argument if it doesn't contain a slash (/)", () => {
			const themeId = getThemeIdFromStylesheet( 'twentysixteen' );
			expect( themeId ).to.equal( 'twentysixteen' );
		} );

		test( "should return argument's part after the slash if it does contain a slash (/)", () => {
			const themeId = getThemeIdFromStylesheet( 'pub/twentysixteen' );
			expect( themeId ).to.equal( 'twentysixteen' );
		} );
	} );

	describe( '#getNormalizedThemesQuery()', () => {
		test( 'should exclude default values', () => {
			const query = getNormalizedThemesQuery( {
				page: 4,
				number: 20,
			} );

			expect( query ).to.eql( {
				page: 4,
			} );
		} );
	} );

	describe( '#getSerializedThemesQuery()', () => {
		test( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedThemesQuery( {
				type: 'page',
				page: 1,
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		test( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedThemesQuery(
				{
					search: 'Hello',
				},
				2916284
			);

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'getDeserializedThemesQueryDetails()', () => {
		test( 'should return undefined query and site if string does not contain JSON', () => {
			const queryDetails = getDeserializedThemesQueryDetails( 'bad' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: undefined,
			} );
		} );

		test( 'should return query but not site if string does not contain site prefix', () => {
			const queryDetails = getDeserializedThemesQueryDetails( '{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: { search: 'hello' },
			} );
		} );

		test( 'should return query and site if string contains site prefix and JSON', () => {
			const queryDetails = getDeserializedThemesQueryDetails( '2916284:{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: 2916284,
				query: { search: 'hello' },
			} );
		} );
	} );

	describe( '#getSerializedThemesQueryWithoutPage()', () => {
		test( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedThemesQueryWithoutPage( {
				type: 'page',
				page: 2,
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		test( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedThemesQueryWithoutPage(
				{
					search: 'Hello',
					page: 2,
				},
				2916284
			);

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( '#matches()', () => {
		const DEFAULT_THEME = {
			id: 'twentysomething',
			name: 'Twenty Something',
			author: 'the WordPress team',
			screenshot:
				'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysomething/screenshot.png',
			screenshots: [
				'https://i0.wp.com/theme.files.wordpress.com/2015/12/twentysomething-featured-image.jpg?ssl=1',
			],
			stylesheet: 'pub/twentysomething',
			taxonomies: {
				theme_feature: [
					{
						name: 'Custom Header',
						slug: 'custom-header',
					},
					{
						name: 'Infinite Scroll',
						slug: 'infinite-scroll',
					},
				],
				theme_color: [
					{
						name: 'Black',
						slug: 'black',
						term_id: '59007',
					},
					{
						name: 'Blue',
						slug: 'blue',
						term_id: '9150',
					},
					{
						name: 'Gray',
						slug: 'gray',
						term_id: '147520',
					},
				],
			},
			demo_uri: 'https://twentysomethingdemo.wordpress.com/',
			descriptionLong:
				'The annual WordPress theme for this year is a modern take on an ever-popular layout. ' +
				'The horizontal header area with an optional right sidebar works perfectly for both blogs <em>and</em> websites.',
			description:
				'This is a modernized take on an ever-popular WordPress layout' +
				' — the horizontal masthead with an optional right sidebar that works perfectly for blogs and websites.',
		};

		describe( 'query.search', () => {
			test( 'should return false for a non-matching search', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'nonexisting',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.false;
			} );

			test( 'should return true for a falsey search', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: null,
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching ID search', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'twentysomething',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching title search', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'Twenty',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching content search', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'modern',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching author search', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'team',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching filter search', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'infinite',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should search case-insensitive', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'Sidebar',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should separately test title and content fields', () => {
				const isMatch = isThemeMatchingQuery(
					{
						search: 'TwentyThe',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.false;
			} );
		} );

		describe( 'query.filter', () => {
			test( 'should return false if theme does not include filter', () => {
				const isMatch = isThemeMatchingQuery(
					{
						filter: 'nosuchfilter',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.false;
			} );

			test( 'should return false on a partial match', () => {
				const isMatch = isThemeMatchingQuery(
					{
						filter: 'ourna',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.false;
			} );

			test( 'should return true if theme includes filter', () => {
				const isMatch = isThemeMatchingQuery(
					{
						filter: 'infinite-scroll',
					},
					DEFAULT_THEME
				);

				expect( isMatch ).to.be.true;
			} );

			describe( 'with multiple filters from a single taxonomy', () => {
				test( "should return false if theme doesn't match all filters", () => {
					const isMatch = isThemeMatchingQuery(
						{
							filter: 'infinite-scroll,business',
						},
						DEFAULT_THEME
					);

					expect( isMatch ).to.be.false;
				} );
				test( 'should return true if theme matches all filters', () => {
					const isMatch = isThemeMatchingQuery(
						{
							filter: 'infinite-scroll,custom-header',
						},
						DEFAULT_THEME
					);

					expect( isMatch ).to.be.true;
				} );
			} );

			describe( 'with multiple filters from different taxonomies', () => {
				test( "should return false if theme doesn't match all filters", () => {
					const isMatch = isThemeMatchingQuery(
						{
							filter: 'infinite-scroll,green',
						},
						DEFAULT_THEME
					);

					expect( isMatch ).to.be.false;
				} );
				test( 'should return true if theme matches all filters', () => {
					const isMatch = isThemeMatchingQuery(
						{
							filter: 'infinite-scroll,black',
						},
						DEFAULT_THEME
					);

					expect( isMatch ).to.be.true;
				} );
			} );
		} );
	} );
} );
