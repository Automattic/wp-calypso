/**
 * @jest-environment jsdom
 */
import { domainProductSlugs } from 'calypso/lib/domains/constants';
import { isRefactoredForThankYouV2 } from '../utils';

describe( 'isRefactoredForThankYouV2', () => {
	it( 'should return false if there are no purchases', () => {
		const props = {
			receipt: {
				purchases: [],
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( false );
	} );

	it( 'should return false if the purchases contain delayed domain transfers', () => {
		const props = {
			receipt: {
				purchases: [ { productSlug: domainProductSlugs.TRANSFER_IN, delayedProvisioning: true } ],
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( false );
	} );

	it( 'should return true if the purchases exist and are not delayed transfer', () => {
		const props = {
			receipt: {
				purchases: [ { productSlug: 'any_other_product' } ],
			},
		};
		expect( isRefactoredForThankYouV2( props ) ).toBe( true );
	} );
} );
