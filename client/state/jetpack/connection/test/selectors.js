/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getJetpackConnectionStatus,
	isJetpackSiteInDevelopmentMode,
	isJetpackSiteInStagingMode
} from '../selectors';
import { items as ITEMS_FIXTURE } from './fixture';

describe( 'selectors', () => {
	describe( '#getJetpackConnectionStatus', () => {
		it( 'should return connection status for a known site', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = getJetpackConnectionStatus( stateIn, siteId );
			expect( output ).to.eql( ITEMS_FIXTURE[ siteId ] );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = getJetpackConnectionStatus( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isJetpackSiteInDevelopmentMode', () => {
		it( 'should return true if the site is in development mode', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 87654321;
			const output = isJetpackSiteInDevelopmentMode( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the site is not in development mode', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isJetpackSiteInDevelopmentMode( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if the site is not known yet', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isJetpackSiteInDevelopmentMode( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isJetpackSiteInStagingMode', () => {
		it( 'should return true if the site is in staging mode', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 87654321;
			const output = isJetpackSiteInStagingMode( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the site is not in staging mode', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isJetpackSiteInStagingMode( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if the site is not known yet', () => {
			const stateIn = {
					jetpack: {
						jetpackConnection: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isJetpackSiteInStagingMode( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );
} );
