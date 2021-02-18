/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';

describe( 'getSiteGmtOffset()', () => {
	test( 'should return null if the site has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {},
			},
		};

		const offset = getSiteGmtOffset( stateTree, 2916284 );
		expect( offset ).to.be.null;
	} );

	test( 'should return null if the site-settings has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {},
				},
			},
		};

		const offset = getSiteGmtOffset( stateTree, 2916284 );
		expect( offset ).to.be.null;
	} );

	test( 'should return the site-settings utc offset', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						gmt_offset: '11',
					},
				},
			},
		};

		const offset = getSiteGmtOffset( stateTree, 2916284 );
		expect( offset ).to.eql( 11 );
	} );
} );
