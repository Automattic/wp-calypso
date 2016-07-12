/**
 * External dependencies
 */
import { expect } from 'chai';
import { fromJS } from 'immutable';
import deepFreeze from 'deep-freeze';
import { Map } from 'immutable';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	SERVER_DESERIALIZE,
	THEME_ACTIVATED
} from 'state/action-types';
import reducer, { initialState } from '../reducer';

describe( 'themes reducer', () => {
	describe( 'theme activation', () => {
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

			const state = reducer( Map( { themes: Map( { twentyfifteen, twentysixteen } ) } ), {
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

			expect( state.getIn( [ 'themes', 'twentysixteen' ] ).get( 'active' ) ).to.be.true;
			expect( state.getIn( [ 'themes', 'twentyfifteen' ] ).get( 'active' ) ).to.be.not.true;
		} );
	} );

	describe( 'persistence', () => {
		it( 'does not persist state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				themes: {
					activetest: {
						active: true,
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = fromJS( jsObject );
			const persistedState = reducer( state, { type: SERIALIZE } );
			expect( persistedState ).to.eql( {} );
		} );
		it( 'does not load persisted state because this is not implemented yet', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				themes: {
					activetest: {
						active: true,
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = reducer( jsObject, { type: DESERIALIZE } );
			expect( state ).to.eql( initialState );
		} );

		it( 'converts state from server to immutable.js object', () => {
			const jsObject = deepFreeze( {
				currentSiteId: 12345678,
				themes: {
					activetest: {
						active: true,
						id: 'activetest',
						author: 'activetest author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium',
						price: '$79'
					},
					test: {
						id: 'test',
						author: 'test author',
						screenshot: 'http://example.com',
						author_uri: 'http://example.com',
						demo_uri: 'http://example.com',
						name: 'active test',
						stylesheet: 'premium'
					}
				}
			} );
			const state = reducer( jsObject, { type: SERVER_DESERIALIZE } );
			expect( state ).to.eql( fromJS( jsObject ) );
		} );
	} );
} );
