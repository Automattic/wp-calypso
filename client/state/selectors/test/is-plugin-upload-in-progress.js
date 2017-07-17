/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isPluginUploadInProgress } from 'state/selectors';

const siteId = 77203074;

describe( 'isPluginUploadInProgress', () => {
	it( 'should return false by default', () => {
		const state = deepFreeze( {
			plugins: {
				upload: {
					inProgress: {}
				}
			}
		} );
		expect( isPluginUploadInProgress( state, siteId ) ).to.be.false;
	} );

	it( 'should return current value for site', () => {
		const stateFalse = deepFreeze( {
			plugins: {
				upload: {
					inProgress: {
						[ siteId ]: false,
					}
				}
			}
		} );
		expect( isPluginUploadInProgress( stateFalse, siteId ) ).to.be.false;

		const stateTrue = deepFreeze( {
			plugins: {
				upload: {
					inProgress: {
						[ siteId ]: true,
					}
				}
			}
		} );
		expect( isPluginUploadInProgress( stateTrue, siteId ) ).to.be.true;
	} );
} );
