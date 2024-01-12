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

	it( 'should return true if there are multiple purchases that only contains domains', () => {
		const props = {
			receipt: {
				data: {
					purchases: [
						{ productSlug: 'domain_map' },
						{ productSlug: 'dotblog_domain', isDomainRegistration: true },
					],
					failedPurchases: [],
				},
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( true );
	} );

	it( 'should return false if the purchase is not supported', () => {
		const props = {
			receipt: {
				data: {
					purchases: [ { productSlug: 'jetpack-personal' } ],
					failedPurchases: [],
				},
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( false );
	} );
} );
