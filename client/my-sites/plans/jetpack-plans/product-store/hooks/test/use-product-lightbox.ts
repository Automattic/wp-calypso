/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useIsOnSale from '../../../use-is-on-sale';
import { useProductLightbox } from '../use-product-lightbox';

jest.mock( 'calypso/state', () => ( { useDispatch: () => jest.fn() } ) );
jest.mock( '../../../use-is-on-sale', () => jest.fn() );

const openedFromHash = ( hash: string, ...slugsOnSale: string[] ) => {
	window.location.hash = hash;
	jest.mocked( useIsOnSale ).mockReturnValue( ( slug: string ) => slugsOnSale.includes( slug ) );
	const { result } = renderHook( () => useProductLightbox() );
	return result.current.currentProduct?.productSlug ?? null;
};

describe( 'useProductLightbox', () => {
	it( 'opens a linked bundle that is on sale', () => {
		expect( openedFromHash( '#jetpack_pro_yearly', 'jetpack_pro_yearly' ) ).toBe(
			'jetpack_pro_yearly'
		);
	} );

	it.each( [ 'jetpack_security_t1_yearly', 'jetpack_pro_monthly', 'jetpack_pro_yearly' ] )(
		'does not open %s while it is off sale',
		( slug ) => {
			expect( openedFromHash( `#${ slug }` ) ).toBeNull();
		}
	);

	it( 'still opens a linked standalone product', () => {
		expect( openedFromHash( '#jetpack_scan' ) ).toBe( 'jetpack_scan' );
	} );
} );
