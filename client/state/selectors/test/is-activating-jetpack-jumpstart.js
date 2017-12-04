/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isActivatingJetpackJumpstart } from 'state/selectors';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-jumpstart';

describe( 'isActivatingJetpackJumpstart()', () => {
	test( 'should return true if jumpstart is currently being activated', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE,
					},
				},
			},
			siteId = 12345678;
		const output = isActivatingJetpackJumpstart( stateIn, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return false if jumpstart is currently not being activated', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE,
					},
				},
			},
			siteId = 87654321;
		const output = isActivatingJetpackJumpstart( stateIn, siteId );
		expect( output ).to.be.false;
	} );

	test( 'should return null if that site is not known yet', () => {
		const stateIn = {
				jetpack: {
					jumpstart: {
						requests: REQUESTS_FIXTURE,
					},
				},
			},
			siteId = 88888888;
		const output = isActivatingJetpackJumpstart( stateIn, siteId );
		expect( output ).to.be.null;
	} );
} );
