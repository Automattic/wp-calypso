/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJetpackSettingsSaveRequestStatus } from '../';

describe( 'getJetpackSettingsSaveRequestStatus()', () => {
	it( 'should return undefined if the site is not attached', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: true, status: 'pending' }
					}
				}
			}
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 87654321 );

		expect( status ).to.be.undefined;
	} );

	it( 'should return success if the save request status is success', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'success' }
					}
				}
			}
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 12345678 );

		expect( status ).to.eql( 'success' );
	} );

	it( 'should return error if the save request status is error', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'error' }
					}
				}
			}
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 12345678 );

		expect( status ).to.eql( 'error' );
	} );

	it( 'should return pending if the save request status is pending', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: true, status: 'pending' }
					}
				}
			}
		};
		const status = getJetpackSettingsSaveRequestStatus( state, 12345678 );

		expect( status ).to.eql( 'pending' );
	} );
} );
