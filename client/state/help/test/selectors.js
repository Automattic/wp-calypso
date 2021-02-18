/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getHelpSiteId, getHelpSelectedSiteId } from '../selectors';

describe( 'selectors', () => {
	describe( '#getHelpSiteId()', () => {
		test( 'should return null for default state', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: null,
				},
			} );

			expect( getHelpSiteId( state ) ).toEqual( null );
		} );

		test( 'should return courses for given state', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: 1234,
				},
			} );

			expect( getHelpSiteId( state ) ).toEqual( state.help.selectedSiteId );
		} );
	} );
	describe( '#getHelpSelectedSiteId()', () => {
		test( 'defaults to customer chosen site', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: 1234,
				},
				sites: {
					items: {
						1234: { ID: 1234 },
						77203074: { ID: 77203074 },
						2916284: { ID: 2916284 },
					},
				},
				ui: {
					selectedSiteId: 2916284,
				},
				currentUser: {
					id: 5678,
					capabilities: {},
					user: {
						ID: 5678,
						primary_blog: 77203074,
					},
				},
			} );
			expect( getHelpSelectedSiteId( state ) ).toEqual( 1234 );
		} );

		test( 'uses selected site if customer selected site is not available', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: null,
				},
				sites: {
					items: {
						1234: { ID: 1234 },
						2916284: { ID: 2916284 },
						77203074: { ID: 77203074 },
					},
				},
				ui: {
					selectedSiteId: 2916284,
				},
				currentUser: {
					id: 5678,
					capabilities: {},
					user: {
						ID: 5678,
						primary_blog: 77203074,
					},
				},
			} );
			expect( getHelpSelectedSiteId( state ) ).toEqual( 2916284 );
		} );

		test( 'uses primary site if customer selected site or global selected site is not available', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: null,
				},
				sites: {
					items: {
						1234: { ID: 1234 },
						2916284: { ID: 2916284 },
						77203074: { ID: 77203074 },
					},
				},
				ui: {
					selectedSiteId: null,
				},
				currentUser: {
					id: 5678,
					capabilities: {},
					user: {
						ID: 5678,
						primary_blog: 77203074,
					},
				},
			} );
			expect( getHelpSelectedSiteId( state ) ).toEqual( 77203074 );
		} );

		test( 'if customer selected site is not available, uses first site', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: 1234,
				},
				sites: {
					items: {
						2916284: { ID: 2916284 },
						77203074: { ID: 77203074 },
					},
				},
				ui: {
					selectedSiteId: null,
				},
				currentUser: {
					id: 5678,
					capabilities: {},
					user: {
						ID: 5678,
						primary_blog: 77203074,
					},
				},
			} );
			expect( getHelpSelectedSiteId( state ) ).toEqual( 2916284 );
		} );

		test( 'if selected site is not available, uses first site', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: null,
				},
				sites: {
					items: {
						77203074: { ID: 77203074 },
					},
				},
				ui: {
					selectedSiteId: 2916284,
				},
				currentUser: {
					id: 5678,
					capabilities: {},
					user: {
						ID: 5678,
						primary_blog: 1234,
					},
				},
			} );
			expect( getHelpSelectedSiteId( state ) ).toEqual( 77203074 );
		} );

		test( 'if sites are not loaded, returns null', () => {
			const state = deepFreeze( {
				help: {
					selectedSiteId: 1234,
				},
				sites: {
					items: null,
				},
				ui: {
					selectedSiteId: 2916284,
				},
				currentUser: {
					id: 5678,
					capabilities: {},
					user: {
						ID: 5678,
						primary_blog: 1234,
					},
				},
			} );
			expect( getHelpSelectedSiteId( state ) ).toEqual( null );
		} );
	} );
} );
