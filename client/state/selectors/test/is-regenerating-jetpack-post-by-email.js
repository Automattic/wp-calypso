/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRegeneratingJetpackPostByEmail } from '../';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-settings';

describe( 'isRegeneratingJetpackPostByEmail()', () => {
	it( 'should return true if post by email is currently being regenerated', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 12345678;
		const output = isRegeneratingJetpackPostByEmail( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	it( 'should return false if post by email is currently not being regenerated', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 87654321;
		const output = isRegeneratingJetpackPostByEmail( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	it( 'should return null if that site is not known', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 88888888;
		const output = isRegeneratingJetpackPostByEmail( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
