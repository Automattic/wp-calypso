/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSiteCustomizable } from '../';

describe( 'isSiteCustomizable()', () => {
	it( 'should return null if the capability is not set for the current user', () => {
		const isCustomizable = isSiteCustomizable( {
			sites: {
				items: {
					77203199: {
						ID: 77203199,
						URL: 'https://example.com'
					}
				}
			},
			currentUser: {
				id: 12345678,
				capabilities: {
					77203199: {}
				}
			}
		}, 77203199 );

		expect( isCustomizable ).to.be.null;
	} );

	it( 'should return true is the corresponding user capability is true for this site', () => {
		const isCustomizable = isSiteCustomizable( {
			sites: {
				items: {
					77203199: {
						ID: 77203199,
						URL: 'http://example.com',
						options: {
							unmapped_url: 'http://example.com'
						}
					}
				}
			},
			currentUser: {
				id: 12345678,
				capabilities: {
					77203199: {
						edit_theme_options: true
					}
				}
			}
		}, 77203199 );

		expect( isCustomizable ).to.be.true;
	} );
} );
