/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getJetpackSettingsSaveError } from 'state/selectors';

describe( 'getJetpackSettingsSaveError()', () => {
	test( 'should return false if the site is not attached', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: true, status: 'pending', error: false },
					},
				},
			},
		};
		const error = getJetpackSettingsSaveError( state, 87654321 );

		expect( error ).to.be.false;
	} );

	test( 'should return false if the save the last request has no error', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'success', error: false },
					},
				},
			},
		};
		const error = getJetpackSettingsSaveError( state, 12345678 );

		expect( error ).to.be.false;
	} );

	test( 'should return the error if the save request status has an error', () => {
		const state = {
			jetpack: {
				settings: {
					saveRequests: {
						12345678: { saving: false, status: 'error', error: 'my Error' },
					},
				},
			},
		};
		const error = getJetpackSettingsSaveError( state, 12345678 );

		expect( error ).to.eql( 'my Error' );
	} );
} );
