/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';

const siteId = 77203074;

describe( 'getUploadedPluginId', () => {
	test( 'should return null by default', () => {
		const state = {
			plugins: {
				upload: {
					uploadedPluginId: {},
				},
			},
		};
		expect( getUploadedPluginId( state, siteId ) ).to.be.null;
	} );

	test( 'should return current value for site', () => {
		const state = {
			plugins: {
				upload: {
					uploadedPluginId: {
						[ siteId ]: 'hello-dolly',
					},
				},
			},
		};
		expect( getUploadedPluginId( state, siteId ) ).to.be.equal( 'hello-dolly' );
	} );
} );
