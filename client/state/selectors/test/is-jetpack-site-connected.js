import isJetpackSiteConnected from 'calypso/state/selectors/is-jetpack-site-connected';
import { items as ITEMS_FIXTURE } from './fixtures/jetpack-connection';

describe( 'isJetpackSiteConnected()', () => {
	test( 'should return true if the site is connected', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 87654321;
		const output = isJetpackSiteConnected( stateIn, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if the site is not connected', () => {
		const stateIn = {
			jetpack: {
				connection: {
					items: ITEMS_FIXTURE,
				},
			},
		};
		const siteId = 12345678;
		const output = isJetpackSiteConnected( stateIn, siteId );
		expect( output ).toBe( false );
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
		const output = isJetpackSiteConnected( stateIn, siteId );
		expect( output ).toBeNull();
	} );
} );
