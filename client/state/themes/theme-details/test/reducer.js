/**
 * External dependencies
 */
import { expect } from 'chai';
import { Map, fromJS } from 'immutable';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
	SERVER_DESERIALIZE,
	THEME_ACTIVATED,
	THEME_DETAILS_RECEIVE
} from 'state/action-types';
import reducer from '../reducer';
import deepFreeze from 'deep-freeze';

describe( 'reducer', () => {
	it( 'should default to an empty Immutable Map', () => {
		const state = reducer( undefined, {} );

		expect( state.toJS() ).to.be.empty;
	} );

	it( 'should set theme details for the given ID', () => {
		const state = reducer( undefined, {
			type: THEME_DETAILS_RECEIVE,
			themeId: 'mood',
			themeName: 'Mood',
			themeAuthor: 'Automattic',
			themeScreenshot: 'mood.jpg',
			themeScreenshots: ['long_mood.jpg'],
			themePrice: '$20',
			themeDescription: 'the best theme ever invented',
			themeDescriptionLong: 'the plato form of a theme',
			themeSupportDocumentation: 'support comes from within',
			themeStylesheet: 'premium/mood',
			themeDownload: 'mood.zip',
			themeDemoUri: 'https://mooddemo.wordpress.com/',
			themeTaxonomies: {
				features: [ {
					term_id: null,
					name: 'Blog Excerpts',
					slug: 'blog-excerpts',
					term_group: '',
					term_taxonomy_id: 0,
					taxonomy: '',
					description: '',
					parent: 0,
					count: 0,
					filter: 'raw'
				} ]
			},
			themeActive: false,
			themePurchased: false
		} );

		expect( state.get( 'mood' ).toJS() ).to.eql( {
			name: 'Mood',
			author: 'Automattic',
			screenshot: 'mood.jpg',
			screenshots: ['long_mood.jpg'],
			price: '$20',
			description: 'the best theme ever invented',
			descriptionLong: 'the plato form of a theme',
			supportDocumentation: 'support comes from within',
			stylesheet: 'premium/mood',
			download: 'mood.zip',
			demo_uri: 'https://mooddemo.wordpress.com/',
			taxonomies: {
				features: [ {
					term_id: null,
					name: 'Blog Excerpts',
					slug: 'blog-excerpts',
					term_group: '',
					term_taxonomy_id: 0,
					taxonomy: '',
					description: '',
					parent: 0,
					count: 0,
					filter: 'raw'
				} ]
			},
			active: false,
			purchased: false
		} );
	} );

	// Copied from state/themes/themes/test/reducer
	it( 'should set the `active` field to true for the given ID on theme activation', () => {
		const twentyfifteen = Map( {
			name: 'Twenty Fifteen',
			author: 'the WordPress team',
			screenshot: 'https://i1.wp.com/theme.wordpress.com/wp-content/themes/pub/twentyfifteen/screenshot.png',
			description: 'Our 2015 default theme is clean, blog-focused, and designed for clarity. ...',
			descriptionLong: '<p>Something something</p>',
			download: 'https://public-api.wordpress.com/rest/v1/themes/download/twentyfifteen.zip',
			taxonomies: {},
			stylesheet: 'pub/twentyfifteen',
			demo_uri: 'https://twentyfifteendemo.wordpress.com/',
			active: true
		} );
		const twentysixteen = Map( {
			name: 'Twenty Sixteen',
			author: 'the WordPress team',
			screenshot: 'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
			description: 'Twenty Sixteen is a modernized take on an ever-popular WordPress layout — ...',
			descriptionLong: '<p>Mumble Mumble</p>',
			download: 'https://public-api.wordpress.com/rest/v1/themes/download/twentysixteen.zip',
			taxonomies: {},
			stylesheet: 'pub/twentysixteen',
			demo_uri: 'https://twentysixteendemo.wordpress.com/'
		} );
		const initialState = Map( { twentyfifteen, twentysixteen } );

		const state = reducer( initialState, {
			type: THEME_ACTIVATED,
			theme: {
				author: 'the WordPress team',
				author_uri: 'https://wordpress.org/',
				demo_uri: 'https://twentysixteendemo.wordpress.com/',
				id: 'twentysixteen',
				name: 'Twenty Sixteen',
				screenshot: 'https://i0.wp.com'
			},
			site: {
				ID: 2916284,
				name: 'Testy McTestsite',
				description: 'Nothing to see here. Move on.',
				URL: 'https://example.wordpress.com'
			}
		} );

		expect( state.get( 'twentysixteen' ).get( 'active' ) ).to.be.true;
		expect( state.get( 'twentyfifteen' ).get( 'active' ) ).to.be.not.true;
	} );

	describe( 'persistence', () => {
		it( 'does not persist state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = fromJS( jsObject );
			const persistedState = reducer( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( {} );
		} );
		it( 'does not load persisted state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( Map() );
		} );

		it( 'converts state from server to immutable.js object', () => {
			const jsObject = deepFreeze( {
				mood: {
					name: 'Mood',
					author: 'Automattic'
				}
			} );
			const state = reducer( jsObject, { type: SERVER_DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );
	} );
} );
