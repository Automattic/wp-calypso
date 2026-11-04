/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useIsOnSale from 'calypso/my-sites/plans/jetpack-plans/use-is-on-sale';
import { useProductsToCompare } from '../useProductsToCompare';

jest.mock( 'calypso/my-sites/plans/jetpack-plans/use-is-on-sale', () => jest.fn() );

const columnsWhenOnSale = ( ...slugs: string[] ) => {
	jest.mocked( useIsOnSale ).mockReturnValue( ( slug: string ) => slugs.includes( slug ) );
	const { result } = renderHook( () => useProductsToCompare() );
	return result.current.map( ( { id } ) => id );
};

describe( 'useProductsToCompare', () => {
	it( 'keeps today’s columns while Pro is off sale', () => {
		expect(
			columnsWhenOnSale( 'jetpack_growth_yearly', 'jetpack_security_t1_yearly', 'jetpack_complete' )
		).toEqual( [ 'FREE', 'GROWTH', 'SECURITY', 'COMPLETE' ] );
	} );

	it( 'compares Free, Pro and Complete after launch', () => {
		expect( columnsWhenOnSale( 'jetpack_pro_yearly', 'jetpack_complete' ) ).toEqual( [
			'FREE',
			'PRO',
			'COMPLETE',
		] );
	} );

	it( 'keeps only Free when product data is missing', () => {
		expect( columnsWhenOnSale() ).toEqual( [ 'FREE' ] );
	} );
} );
