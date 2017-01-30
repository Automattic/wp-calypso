
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getBackPath } from '../selectors';

describe( 'selectors', () => {
	describe( '#getBackPath', () => {
		it( 'should return the back path', () => {
			const state = {
				themes: {
					themesUI: {
						backPath: '/design',
					}
				},
				ui: {}
			};
			expect( getBackPath( state ) ).to.eql( '/design' );
		} );

		it( 'should return default path with selected site if selected site not in stored path', () => {
			const state = {
				themes: {
					themesUI: {
						backPath: '/design/premium',
					}
				},
				sites: {
					items: {
						2916284: {
							ID: 2916284,
							URL: 'https://example.wordpress.com',
						}
					}
				},
				ui: {
					selectedSiteId: 2916284,
				}
			};
			expect( getBackPath( state ) ).to.eql( '/design/example.wordpress.com' );
		} );
	} );
} );
