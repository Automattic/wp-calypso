/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getPluginUploadProgress } from 'state/selectors';

const siteId = 77203074;

describe( 'getPluginUploadProgress', () => {
	it( 'should return 0 by default', () => {
		const state = deepFreeze( {
			plugins: {
				upload: {
					progressPercent: {}
				}
			}
		} );
		expect( getPluginUploadProgress( state, siteId ) ).to.equal( 0 );
	} );

	it( 'should return current value for site', () => {
		const state = deepFreeze( {
			plugins: {
				upload: {
					progressPercent: {
						[ siteId ]: 73,
					},
				},
			},
		} );
		expect( getPluginUploadProgress( state, siteId ) ).to.equal( 73 );
	} );
} );
