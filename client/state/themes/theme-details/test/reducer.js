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
