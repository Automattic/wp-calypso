/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSavingSharingButtons } from '../';

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
		const isSaving = isSavingSharingButtons( state, 2916285 );

		expect( isSaving ).to.be.false;
	} );

	it( 'should return false if the sharing buttons are not being saved', () => {
		const state = {
			sites: {
				sharingButtons: {
					saveRequests: {
						2916284: { saving: false, status: 'success' }
					}
				}
			}
		};
		const isSaving = isSavingSharingButtons( state, 2916284 );

		expect( isSaving ).to.be.false;
	} );

	it( 'should return true if the sharing buttons are being saved', () => {
		const state = {
			sites: {
				sharingButtons: {
					saveRequests: {
						2916284: { saving: true, status: 'pending' }
					}
				}
			}
		};
		const isSaving = isSavingSharingButtons( state, 2916284 );

		expect( isSaving ).to.be.true;
	} );
} );
