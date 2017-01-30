/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingJetpackSettings } from '../';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-settings';

describe( 'isRequestingJetpackSettings()', () => {
	it( 'should return true if settings are currently being requested', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 87654321;
		const output = isRequestingJetpackSettings( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	it( 'should return false if settings are currently not being requested', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE
					}
				}
			},
			siteId = 12345678;
		const output = isRequestingJetpackSettings( stateIn, siteId );
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
		const output = isRequestingJetpackSettings( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
