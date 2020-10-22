/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isPluginUploadInProgress from 'calypso/state/selectors/is-plugin-upload-in-progress';

const siteId = 77203074;

describe( 'isPluginUploadInProgress', () => {
	test( 'should return false by default', () => {
		const state = {
			plugins: {
				upload: {
					inProgress: {},
				},
			},
		};
		expect( isPluginUploadInProgress( state, siteId ) ).to.be.false;
	} );

	test( 'should return current value for site', () => {
		const stateFalse = {
			plugins: {
				upload: {
					inProgress: {
						[ siteId ]: false,
					},
				},
			},
		};
		expect( isPluginUploadInProgress( stateFalse, siteId ) ).to.be.false;

		const stateTrue = {
			plugins: {
				upload: {
					inProgress: {
						[ siteId ]: true,
					},
				},
			},
		};
		expect( isPluginUploadInProgress( stateTrue, siteId ) ).to.be.true;
	} );
} );
