/**
 * Internal dependencies
 */
import { isFetchingAutomatedTransferStatus } from '../selectors';

describe( 'isFetchingAutomatedTransferStatus()', () => {
	test(
		'should return null if siteId was not specified or the specified siteId was not found' +
			' in the automatedTransfer state',
		() => {
			const state = {
				automatedTransfer: {},
			};

			expect( isFetchingAutomatedTransferStatus( state ) ).toBeNull();
			expect( isFetchingAutomatedTransferStatus( state, 12345 ) ).toBeNull();
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

		expect( isFetchingAutomatedTransferStatus( state, 12345 ) ).toBe( false );
	} );

	test( 'should return true when transfer status is being fetched for a given site', () => {
		const state = {
			automatedTransfer: {
				12345: {
					fetchingStatus: true,
				},
			},
		};

		expect( isFetchingAutomatedTransferStatus( state, 12345 ) ).toBe( true );
	} );
} );
