/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';

const siteId = 77203074;

describe( 'isPluginUploadComplete', () => {
	test( 'should return false by default', () => {
		const state = {
			plugins: {
				upload: {
					inProgress: {},
					uploadedPluginId: {},
				},
			},
		};
		expect( isPluginUploadComplete( state, siteId ) ).to.be.false;
	} );

	test( 'should return false if no plugin id available', () => {
		const state = {
			plugins: {
				upload: {
					inProgress: {
						[ siteId ]: false,
					},
					uploadedPluginId: {},
				},
			},
		};
		expect( isPluginUploadComplete( state, siteId ) ).to.be.false;
	} );

	test( 'should return false if upload still in progress', () => {
		const state = {
			plugins: {
				upload: {
					inProgress: {
						[ siteId ]: true,
					},
					uploadedPluginId: {
						[ siteId ]: 'hello-dolly',
					},
				},
			},
		};
		expect( isPluginUploadComplete( state, siteId ) ).to.be.false;
	} );

	test( 'should return true if upload not in progress and plugin id present', () => {
		const state = {
			plugins: {
				upload: {
					inProgress: {
						[ siteId ]: false,
					},
					uploadedPluginId: {
						[ siteId ]: 'hello-dolly',
					},
				},
			},
		};
		expect( isPluginUploadComplete( state, siteId ) ).to.be.true;
	} );
} );
