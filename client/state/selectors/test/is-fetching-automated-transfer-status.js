/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isFetchingAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';

describe( 'isFetchingAutomatedTransferStatus()', () => {
	test(
		'should return null if siteId was not specified or the specified siteId was not found' +
			' in the automatedTransfer state',
		() => {
			const state = {
				automatedTransfer: {},
			};

			expect( isFetchingAutomatedTransferStatus( state ) ).to.be.null;
			expect( isFetchingAutomatedTransferStatus( state, 12345 ) ).to.be.null;
		}
	);

	test( 'should return false when transfer status is not being fetched yet for a given site', () => {
		const state = {
			automatedTransfer: {
				12345: {
					fetchingStatus: false,
				},
			},
		};

		expect( isFetchingAutomatedTransferStatus( state, 12345 ) ).to.be.false;
	} );

	test( 'should return true when transfer status is being fetched for a given site', () => {
		const state = {
			automatedTransfer: {
				12345: {
					fetchingStatus: true,
				},
			},
		};

		expect( isFetchingAutomatedTransferStatus( state, 12345 ) ).to.be.true;
	} );
} );
