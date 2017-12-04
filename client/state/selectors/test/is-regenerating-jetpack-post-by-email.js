/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRegeneratingJetpackPostByEmail } from 'state/selectors';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-settings';

describe( 'isRegeneratingJetpackPostByEmail()', () => {
	test( 'should return true if post by email is currently being regenerated', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE,
					},
				},
			},
			siteId = 12345678;
		const output = isRegeneratingJetpackPostByEmail( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if post by email is currently not being regenerated', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE,
					},
				},
			},
			siteId = 87654321;
		const output = isRegeneratingJetpackPostByEmail( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return null if that site is not known', () => {
		const stateIn = {
				jetpack: {
					settings: {
						requests: REQUESTS_FIXTURE,
					},
				},
			},
			siteId = 88888888;
		const output = isRegeneratingJetpackPostByEmail( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
