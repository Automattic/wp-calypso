/**
 * Internal dependencies
 */
import { getBackPath } from '../selectors';

describe( 'selectors', () => {
	describe( '#getBackPath', () => {
		test( 'should return the back path', () => {
			const state = {
				themes: {
					themesUI: {
						backPath: '/themes',
					},
				},
				ui: {},
			};
			expect( getBackPath( state ) ).toBe( '/themes' );
		} );

		test( 'should return stored path if it includes current selected site', () => {
			const state = {
				themes: {
					themesUI: {
						backPath: '/themes/premium/example.wordpress.com?s=blue',
					},
				},
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							URL: 'https://example.wordpress.com',
						},
					},
				},
				ui: {
					selectedSiteId: 2916284,
				},
			};
			expect( getBackPath( state ) ).toBe( '/themes/premium/example.wordpress.com?s=blue' );
		} );

		test( 'should return default path with selected site if selected site not in stored path', () => {
			const state = {
				themes: {
					themesUI: {
						backPath: '/themes/premium',
					},
				},
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							URL: 'https://example.wordpress.com',
						},
					},
				},
				ui: {
					selectedSiteId: 2916284,
				},
			};
			expect( getBackPath( state ) ).toBe( '/themes/example.wordpress.com' );
		} );
	} );
} );
