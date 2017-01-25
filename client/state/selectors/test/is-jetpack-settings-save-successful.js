/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isJetpackSettingsSaveSuccessful } from '../';

describe( 'isJetpackSettingsSaveSuccessful()', () => {
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
		const isSuccessful = isJetpackSettingsSaveSuccessful( state, 87654321 );

		expect( isSuccessful ).to.be.false;
	} );

	it( 'should return true if the save request status is success', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'success' }
					}
				}
			}
		};
		const isSuccessful = isJetpackSettingsSaveSuccessful( state, 12345678 );

		expect( isSuccessful ).to.be.true;
	} );

	it( 'should return false if the save request status is error', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'error' }
					}
				}
			}
		};
		const isSuccessful = isJetpackSettingsSaveSuccessful( state, 12345678 );

		expect( isSuccessful ).to.be.false;
	} );
} );
