/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isDeactivatingJumpstart,
	isRequestingJumpstartStatus,
	getJumpstartStatus
} from '../selectors';
import {
	items as ITEMS_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'selectors', () => {
	describe( '#isDeactivatingJumpstart', () => {
		it( 'should return true if jumpstart is currently being deactivated', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 87654321;
			const output = isDeactivatingJumpstart( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if jumpstart is currently not being deactivated', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isDeactivatingJumpstart( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if that site is not known yet', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isDeactivatingJumpstart( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#isRequestingJumpstartStatus', () => {
		it( 'should return true if the jumpstart status is being fetched', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 11223344;
			const output = isRequestingJumpstartStatus( stateIn, siteId );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the jumpstart status is not being fetched', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = isRequestingJumpstartStatus( stateIn, siteId );
			expect( output ).to.be.false;
		} );

		it( 'should return null if the site is not known yet', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							requests: REQUESTS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = isRequestingJumpstartStatus( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getJumpstartStatus', () => {
		it( 'should return jumpstart status for a known site', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 12345678;
			const output = getJumpstartStatus( stateIn, siteId );
			expect( output ).to.eql( 'jumpstart_activated' );
		} );

		it( 'should return null for an unknown site', () => {
			const stateIn = {
					jetpack: {
						jetpackJumpstart: {
							items: ITEMS_FIXTURE
						}
					}
				},
				siteId = 88888888;
			const output = getJumpstartStatus( stateIn, siteId );
			expect( output ).to.be.null;
		} );
	} );
} );
