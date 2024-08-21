/**
 * @jest-environment jsdom
 */
import { domainProductSlugs } from 'calypso/lib/domains/constants';
import { isRefactoredForThankYouV2 } from '../utils';

describe( 'isRefactoredForThankYouV2', () => {
	it( 'should return false if there is a failed purchase', () => {
		const props = {
			receipt: {
				data: {
					failedPurchases: [
						{
							productSlug: 'test-product',
						},
					],
				},
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( false );
	} );

	it( 'should return false if there are no purchases', () => {
		const props = {
			receipt: {
				data: {
					purchases: [],
					failedPurchases: [],
				},
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( false );
	} );

	it( 'should return false if the purchases contain delayed domain transfers', () => {
		const props = {
			receipt: {
				data: {
					purchases: [ { productSlug: domainProductSlugs.TRANSFER_IN, delayedProvisioning: true } ],
					failedPurchases: [],
				},
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( false );
	} );

	it( 'should return true if the purchases exist and are not delayed transfer', () => {
		const props = {
			receipt: {
				data: {
					purchases: [ { productSlug: 'any_other_product' } ],
					failedPurchases: [],
				},
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( true );
	} );
} );
