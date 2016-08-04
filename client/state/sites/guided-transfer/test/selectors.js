/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	isRequestingGuidedTransferStatus
} from '../selectors';

describe( 'selectors', () => {
	const testSiteId = 100658273;

	describe( '#isRequestingGuidedTransferStatus()', () => {
		it( 'should return false for default state {}', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isFetching: {},
					}
				}
			} );

			expect( isRequestingGuidedTransferStatus( state, testSiteId ) ).to.be.false;
		} );

		it( 'should return true when a request is underway', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isFetching: {
							1: false,
							[ testSiteId ]: true,
						},
					}
				}
			} );

			expect( isRequestingGuidedTransferStatus( state, testSiteId ) ).to.be.true;
		} );


		it( 'should return false when a isFetching is false', () => {
			const state = deepFreeze( {
				sites: {
					guidedTransfer: {
						isFetching: {
							1: true,
							[ testSiteId ]: false,
						},
					}
				}
			} );

			expect( isRequestingGuidedTransferStatus( state, testSiteId ) ).to.be.false;
		} );
	} );
} );
