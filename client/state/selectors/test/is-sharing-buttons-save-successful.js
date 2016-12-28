/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSharingButtonsSaveSuccessful } from '../';

describe( 'isRequestingSharingButtons()', () => {
	it( 'should return false if the site is not attached', () => {
		const state = {
			sites: {
				sharingButtons: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' }
					}
				}
			}
		};
		const isSuccessful = isSharingButtonsSaveSuccessful( state, 2916285 );

		expect( isSuccessful ).to.be.false;
	} );

	it( 'should return true if the sharing buttons request status is "success"', () => {
		const state = {
			sites: {
				sharingButtons: {
					saveRequests: {
						2916284: { saving: false, status: 'success' }
					}
				}
			}
		};
		const isSuccessful = isSharingButtonsSaveSuccessful( state, 2916284 );

		expect( isSuccessful ).to.be.true;
	} );

	it( 'should return false if the sharing buttons request status is not "success"', () => {
		const state = {
			sites: {
				sharingButtons: {
					saveRequests: {
						2916284: { saving: false, status: 'error' }
					}
				}
			}
		};
		const isSuccessful = isSharingButtonsSaveSuccessful( state, 2916284 );

		expect( isSuccessful ).to.be.false;
	} );
} );
