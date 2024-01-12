import { findPlansKeys, GROUP_WPCOM } from '@automattic/calypso-products';
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

	it( 'should return true if the purchases contain only domain transfers', () => {
		const props = {
			receipt: {
				data: {
					purchases: [ { productSlug: domainProductSlugs.TRANSFER_IN } ],
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

	it( 'should return true for wpcom plans', () => {
		const wpcomPlans = findPlansKeys( { group: GROUP_WPCOM } );
		const supportedPlans = [ ...wpcomPlans ];
		for ( const plan of supportedPlans ) {
			const props = {
				receipt: {
					data: {
						purchases: [ { productSlug: plan } ],
						failedPurchases: [],
					},
				},
			};
			expect( isRefactoredForThankYouV2( props ) ).toBe( true );
		}
	} );
} );
