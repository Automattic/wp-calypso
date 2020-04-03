/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isSiteWPforteams from 'state/selectors/is-site-wpforteams';

describe( 'isSiteWPforteams()', () => {
	test( 'should return null if the specified site was not found in the state', () => {
		const state = {
			sites: {
				items: {},
			},
		};

		expect( isSiteWPforteams( state, 12345 ) ).to.be.null;
	} );

	test( 'should return false if site is not a WP for Teams one', () => {
		const state = {
			sites: {
				items: {
					12345: {
						options: {
							is_wpforteams_site: false,
						},
					},
				},
			},
		};

		expect( isSiteWPforteams( state, 12345 ) ).to.be.false;
	} );

	test( 'should return true if site is a WP for Teams one', () => {
		const state = {
			sites: {
				items: {
					12345: {
						options: {
							is_wpforteams_site: true,
						},
					},
				},
			},
		};

		expect( isSiteWPforteams( state, 12345 ) ).to.be.true;
	} );
} );
