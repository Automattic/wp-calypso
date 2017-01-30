/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingJetpackJumpstartStatus } from '../';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-jumpstart';

describe( 'isRequestingJetpackJumpstartStatus()', () => {
	it( 'should return true if the jumpstart status is being fetched', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 11223344;
		const output = isRequestingJetpackJumpstartStatus( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	it( 'should return false if the jumpstart status is not being fetched', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 12345678;
		const output = isRequestingJetpackJumpstartStatus( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	it( 'should return null if the site is not known yet', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 88888888;
		const output = isRequestingJetpackJumpstartStatus( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
