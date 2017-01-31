/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteTimezoneString } from '../';

describe( 'getSiteTimezoneString()', () => {
	it( 'should return null if the site has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {}
			}
		};

		const timezone = getSiteTimezoneString( stateTree, 2916284 );
		expect( timezone ).to.be.null;
	} );

	it( 'should return null if the site-settings has never been fetched', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {}
				}
			}
		};

		const timezone = getSiteTimezoneString( stateTree, 2916284 );
		expect( timezone ).to.be.null;
	} );

	it( 'should return null if the timezone_string is an empty string', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						timezone_string: ''
					}
				}
			}
		};

		const timezone = getSiteTimezoneString( stateTree, 2916284 );
		expect( timezone ).to.be.null;
	} );

	it( 'should return site-settings timezone', () => {
		const stateTree = {
			siteSettings: {
				items: {
					2916284: {
						timezone_string: 'Europe/Skopje'
					}
				}
			}
		};

		const timezone = getSiteTimezoneString( stateTree, 2916284 );
		expect( timezone ).to.eql( 'Europe/Skopje' );
	} );
} );
