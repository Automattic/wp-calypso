/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useGetPressablePlan from '../use-get-pressable-plan';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

jest.mock( 'calypso/a8c-for-agencies/data/marketplace/use-products-query' );

const mockUseProductsQuery = useProductsQuery as jest.MockedFunction< typeof useProductsQuery >;

const buildProduct = (
	overrides: Partial< APIProductFamilyProduct > = {}
): APIProductFamilyProduct =>
	( {
		name: 'Test Plan',
		slug: 'pressable-starter',
		product_id: 1,
		currency: 'USD',
		amount: '25.00',
		price_interval: 'monthly',
		family_slug: 'pressable-hosting',
		supported_bundles: [],
		metadata: {
			sites: 1,
			visits: 25000,
			storage: 20,
			php_worker_count: 2,
			category: 'starter',
		},
		...overrides,
	} ) as APIProductFamilyProduct;

describe( 'useGetPressablePlan', () => {
	it( 'returns default values when products are not loaded', () => {
		mockUseProductsQuery.mockReturnValue( { data: undefined } as ReturnType<
			typeof useProductsQuery
		> );

		const { result } = renderHook( () => useGetPressablePlan() );
		const plan = result.current( 'pressable-starter' );

		expect( plan ).toEqual( {
			slug: '',
			install: 0,
			visits: 0,
			storage: 0,
			category: '',
			worker: 0,
		} );
	} );

	it( 'returns default values when slug is not found', () => {
		mockUseProductsQuery.mockReturnValue( {
			data: [ buildProduct() ],
		} as ReturnType< typeof useProductsQuery > );

		const { result } = renderHook( () => useGetPressablePlan() );
		const plan = result.current( 'non-existent-slug' );

		expect( plan ).toEqual( {
			slug: '',
			install: 0,
			visits: 0,
			storage: 0,
			category: '',
			worker: 0,
		} );
	} );

	it( 'returns plan metadata when slug matches', () => {
		mockUseProductsQuery.mockReturnValue( {
			data: [
				buildProduct( {
					slug: 'pressable-starter',
					metadata: {
						sites: 1,
						visits: 25000,
						storage: 20,
						php_worker_count: 2,
						category: 'starter',
					},
				} ),
			],
		} as ReturnType< typeof useProductsQuery > );

		const { result } = renderHook( () => useGetPressablePlan() );
		const plan = result.current( 'pressable-starter' );

		expect( plan ).toEqual( {
			slug: 'pressable-starter',
			install: 1,
			visits: 25000,
			storage: 20,
			worker: 2,
			category: 'starter',
		} );
	} );

	it( 'returns the correct product when multiple products exist', () => {
		mockUseProductsQuery.mockReturnValue( {
			data: [
				buildProduct( {
					slug: 'pressable-starter',
					metadata: { sites: 1, visits: 25000, storage: 20, category: 'starter' },
				} ),
				buildProduct( {
					slug: 'pressable-pro',
					metadata: {
						sites: 5,
						visits: 100000,
						storage: 50,
						php_worker_count: 4,
						category: 'pro',
					},
				} ),
			],
		} as ReturnType< typeof useProductsQuery > );

		const { result } = renderHook( () => useGetPressablePlan() );
		const plan = result.current( 'pressable-pro' );

		expect( plan ).toEqual( {
			slug: 'pressable-pro',
			install: 5,
			visits: 100000,
			storage: 50,
			worker: 4,
			category: 'pro',
		} );
	} );

	it( 'defaults missing metadata fields to zero or empty string', () => {
		mockUseProductsQuery.mockReturnValue( {
			data: [ buildProduct( { slug: 'pressable-basic', metadata: {} } ) ],
		} as ReturnType< typeof useProductsQuery > );

		const { result } = renderHook( () => useGetPressablePlan() );
		const plan = result.current( 'pressable-basic' );

		expect( plan ).toEqual( {
			slug: 'pressable-basic',
			install: 0,
			visits: 0,
			storage: 0,
			worker: 0,
			category: '',
		} );
	} );
} );
