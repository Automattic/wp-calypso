import { domainProductSlugs } from 'calypso/lib/domains/constants';
import { isRefactored } from '../utils';

describe( 'isRefactored', () => {
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
		expect( isRefactored( props ) ).toBe( false );
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
		expect( isRefactored( props ) ).toBe( true );
	} );

	it( 'should return true if there are purchases only contain domain transfers', () => {
		const props = {
			receipt: {
				data: {
					purchases: [ { productSlug: domainProductSlugs.TRANSFER_IN } ],
					failedPurchases: [],
				},
			},
		};
		expect( isRefactored( props ) ).toBe( true );
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
		expect( isRefactored( props ) ).toBe( false );
	} );
} );
