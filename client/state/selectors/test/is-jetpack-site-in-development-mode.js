/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import { items as ITEMS_FIXTURE } from './fixtures/jetpack-connection';

describe( 'isJetpackSiteInDevelopmentMode()', () => {
	test( 'should return true if the site is in development mode', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 87654321;
		const output = isJetpackSiteInDevelopmentMode( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if the site is not in development mode', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 12345678;
		const output = isJetpackSiteInDevelopmentMode( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return false if the site is not in development mode with isActive: 0', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 987654321;
		const output = isJetpackSiteInDevelopmentMode( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return null if the site is not known yet', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 88888888;
		const output = isJetpackSiteInDevelopmentMode( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
