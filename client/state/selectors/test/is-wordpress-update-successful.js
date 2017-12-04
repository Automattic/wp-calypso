/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isWordpressUpdateSuccessful } from 'state/selectors';

describe( 'isWordpressUpdateSuccessful()', () => {
	const siteId = 2916284;

	test( 'should return wordpress core update status for a known site', () => {
		const state = {
			sites: {
				updates: {
					wordpressUpdateStatus: {
						[ siteId ]: true,
					},
				},
			},
		};
		const output = isWordpressUpdateSuccessful( state, siteId );
		expect( output ).to.be.true;
	} );

	test( 'should return null for an unknown site', () => {
		const state = {
			sites: {
				updates: {
					wordpressUpdateStatus: {
						77203074: true,
					},
				},
			},
		};
		const output = isWordpressUpdateSuccessful( state, siteId );
		expect( output ).to.be.null;
	} );
} );
