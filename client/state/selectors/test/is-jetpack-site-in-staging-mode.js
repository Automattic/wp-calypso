/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isJetpackSiteInStagingMode from 'calypso/state/selectors/is-jetpack-site-in-staging-mode';
import { items as ITEMS_FIXTURE } from './fixtures/jetpack-connection';

describe( 'isJetpackSiteInStagingMode()', () => {
	test( 'should return true if the site is in staging mode', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 87654321;
		const output = isJetpackSiteInStagingMode( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if the site is not in staging mode', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 12345678;
		const output = isJetpackSiteInStagingMode( stateIn, siteId );
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
		const output = isJetpackSiteInStagingMode( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
