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

	// NOTE: we will eventually support multiple purchases, but for now we only support one
	it( 'should return false if there are multiple purchases', () => {
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
