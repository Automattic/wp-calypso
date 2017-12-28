/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getPluginUploadProgress } from 'client/state/selectors';

const siteId = 77203074;

describe( 'getPluginUploadProgress', () => {
	test( 'should return 0 by default', () => {
		const state = {
			plugins: {
				upload: {
					progressPercent: {},
				},
			},
		};
		expect( getPluginUploadProgress( state, siteId ) ).to.equal( 0 );
	} );

	test( 'should return current value for site', () => {
		const state = {
			plugins: {
				upload: {
					progressPercent: {
						[ siteId ]: 73,
					},
				},
			},
		};
		expect( getPluginUploadProgress( state, siteId ) ).to.equal( 73 );
	} );
} );
