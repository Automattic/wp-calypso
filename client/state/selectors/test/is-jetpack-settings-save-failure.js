/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isJetpackSettingsSaveFailure } from '../';

describe( 'isJetpackSettingsSaveFailure()', () => {
	it( 'should return false if the site is not attached', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: true, status: 'pending' }
					}
				}
			}
		};
		const isFailure = isJetpackSettingsSaveFailure( state, 87654321 );

		expect( isFailure ).to.be.false;
	} );

	it( 'should return false if the save request status is success', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'success' }
					}
				}
			}
		};
		const isFailure = isJetpackSettingsSaveFailure( state, 12345678 );

		expect( isFailure ).to.be.false;
	} );

	it( 'should return true if the save request status is error', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'error' }
					}
				}
			}
		};
		const isFailure = isJetpackSettingsSaveFailure( state, 12345678 );

		expect( isFailure ).to.be.true;
	} );
} );
