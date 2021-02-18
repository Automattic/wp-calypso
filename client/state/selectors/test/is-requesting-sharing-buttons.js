/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isRequestingSharingButtons from 'calypso/state/selectors/is-requesting-sharing-buttons';

describe( 'isRequestingSharingButtons()', () => {
	test( 'should return false if the site is not attached', () => {
		const state = {
			sites: {
				sharingButtons: {
					requesting: {
						2916284: true,
					},
				},
			},
		};
		const isRequesting = isRequestingSharingButtons( state, 2916285 );

		expect( isRequesting ).to.be.false;
	} );

	test( 'should return false if the sharing buttons are not being fetched', () => {
		const state = {
			sites: {
				sharingButtons: {
					requesting: {
						2916284: false,
					},
				},
			},
		};
		const isRequesting = isRequestingSharingButtons( state, 2916284 );

		expect( isRequesting ).to.be.false;
	} );

	test( 'should return true if the sharing buttons are being fetched', () => {
		const state = {
			sites: {
				sharingButtons: {
					requesting: {
						2916284: true,
					},
				},
			},
		};
		const isRequesting = isRequestingSharingButtons( state, 2916284 );

		expect( isRequesting ).to.be.true;
	} );
} );
