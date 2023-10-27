import { findPlansKeys, GROUP_WPCOM } from '@automattic/calypso-products';
import { isRedesignV2 } from '../utils';

describe( 'isRedesignV2', () => {
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
		expect( isRedesignV2( props ) ).toBe( false );
	} );

	it( 'should return false if there are multiple purchases that are not yet supported', () => {
		const props = {
			receipt: {
				data: {
					purchases: [ { productSlug: 'test-product-1' }, { productSlug: 'test-product-2' } ],
					failedPurchases: [],
				},
			},
		};
		expect( isRedesignV2( props ) ).toBe( false );
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
		expect( isRedesignV2( props ) ).toBe( true );
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
		expect( isRedesignV2( props ) ).toBe( false );
	} );

	it( 'should return true for supported plans and there are no failed purchases', () => {
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
			expect( isRedesignV2( props ) ).toBe( true );
		}
	} );
} );
