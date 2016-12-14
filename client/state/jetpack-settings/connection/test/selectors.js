/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingJetpackConnectionStatus,
	getJetpackConnectionStatus,
	isJetpackSiteInDevelopmentMode,
	isJetpackSiteInStagingMode
} from '../selectors';
import {
	items as ITEMS_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isRequestingJetpackConnectionStatus', () => {
		it( 'should return true if the connection status is being fetched', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackConnection: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 87654321;
			const output = isRequestingJetpackConnectionStatus( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the connection status is not being fetched', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackConnection: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isRequestingJetpackConnectionStatus( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if the site is not known yet', () => {
			const stateIn = {
					jetpackSettings: {
						jetpackConnection: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isRequestingJetpackConnectionStatus( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getJetpackConnectionStatus', () => {
		it( 'should return connection status for a known site', () => {
			const stateIn = {
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
					jetpackSettings: {
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
