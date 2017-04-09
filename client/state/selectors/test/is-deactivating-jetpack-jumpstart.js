/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDeactivatingJetpackJumpstart } from '../';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-jumpstart';

describe( 'isDeactivatingJetpackJumpstart()', () => {
	it( 'should return true if jumpstart is currently being deactivated', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 87654321;
		const output = isDeactivatingJetpackJumpstart( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	it( 'should return false if jumpstart is currently not being deactivated', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 12345678;
		const output = isDeactivatingJetpackJumpstart( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	it( 'should return null if that site is not known yet', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 88888888;
		const output = isDeactivatingJetpackJumpstart( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
