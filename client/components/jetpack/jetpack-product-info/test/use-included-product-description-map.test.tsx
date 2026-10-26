/**
 * @jest-environment jsdom
 */
import { getPlan, JETPACK_PRO_PLANS } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import { useIncludedProductDescriptionMap } from '../hooks/use-included-product-description-map';

describe( 'useIncludedProductDescriptionMap', () => {
	it.each( JETPACK_PRO_PLANS )( 'describes every product included in %s', ( planSlug ) => {
		const { result } = renderHook( () => useIncludedProductDescriptionMap( planSlug ) );
		const plan = getPlan( planSlug );
		const includedProducts =
			plan && 'getProductsIncluded' in plan ? ( plan.getProductsIncluded?.() ?? [] ) : [];

		expect( includedProducts.length ).toBeGreaterThan( 0 );
		includedProducts.forEach( ( productSlug ) => {
			expect( result.current[ productSlug ]?.value ).toBeTruthy();
		} );
	} );

	it( 'uses the Pro limits for Pro', () => {
		const { result } = renderHook( () => useIncludedProductDescriptionMap( 'jetpack_pro_yearly' ) );

		expect( result.current.jetpack_backup_t1_yearly.calloutText ).toBe( '50GB cloud storage' );
		expect( result.current.jetpack_stats_yearly.calloutText ).toBe( '50k views/mo' );
		expect( result.current.jetpack_anti_spam.calloutText ).toBe( '10k API calls/mo' );
		expect( result.current.jetpack_search.calloutText ).toBe( '10k records & requests/mo' );
	} );
} );
