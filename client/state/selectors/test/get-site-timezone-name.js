/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getSiteTimezoneName from 'calypso/state/selectors/get-site-timezone-name';

describe( 'getSiteTimezoneName()', () => {
	test( 'should return null if the site has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {},
			},
		};

		const timezone = getSiteTimezoneName( stateTree, 2916284 );
		expect( timezone ).to.be.null;
	} );

	test( 'should return null if the site-settings has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {},
				},
			},
		};

		const timezone = getSiteTimezoneName( stateTree, 2916284 );
		expect( timezone ).to.be.null;
	} );

	test( 'should return site-settings timezone as the first priority', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						timezone_string: 'Europe/Skopje',
						gmt_offset: 11,
					},
				},
			},
		};

		const timezone = getSiteTimezoneName( stateTree, 2916284 );
		expect( timezone ).to.eql( 'Europe/Skopje' );
	} );

	test( 'should return site-settings UTC offset if timezone_string is empty', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						timezone_string: '',
						gmt_offset: '11',
					},
				},
			},
		};

		const timezone = getSiteTimezoneName( stateTree, 2916284 );
		expect( timezone ).to.eql( 'UTC+11' );
	} );

	test( 'should return site-settings UTC offset for negative value', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						timezone_string: '',
						gmt_offset: '-11',
					},
				},
			},
		};

		const timezone = getSiteTimezoneName( stateTree, 2916284 );
		expect( timezone ).to.eql( 'UTC-11' );
	} );
} );
