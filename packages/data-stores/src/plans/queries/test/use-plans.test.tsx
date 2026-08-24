/**
 * @jest-environment jsdom
 */
import { PLAN_BUSINESS, PLAN_PERSONAL } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcomRequest from '../../../wpcom-request';
import usePlans from '../use-plans';
import useSitePlans from '../use-site-plans';
import type { PricedAPIPlan, PricedAPISitePlan } from '../../types';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn( () => false ),
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	useLocale: jest.fn( () => 'en' ),
} ) );

jest.mock( '../../../wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

const mockWpcomRequest = wpcomRequest as jest.Mock;

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( queryClient: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

const makeAPIPlan = ( overrides: Partial< PricedAPIPlan > = {} ): PricedAPIPlan => ( {
	bill_period: 365,
	currency_code: 'USD',
	formatted_price: '$120',
	orig_cost_integer: 12000,
	path_slug: 'personal',
	product_display_price: '$120',
	product_id: 1001,
	product_name: 'Personal',
	product_name_short: 'Personal',
	product_slug: PLAN_PERSONAL,
	raw_price: 120,
	raw_price_integer: 12000,
	...overrides,
} );

const makeAPISitePlan = ( overrides: Partial< PricedAPISitePlan > = {} ): PricedAPISitePlan => ( {
	currency_code: 'USD',
	formatted_price: '$300',
	product_display_price: '$300',
	product_slug: PLAN_BUSINESS,
	raw_discount_integer: 0,
	raw_price: 300,
	raw_price_integer: 30000,
	...overrides,
} );

describe( 'plans query hooks', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'ignores API plans that are not defined in calypso-products', async () => {
		mockWpcomRequest.mockResolvedValue( [
			makeAPIPlan(),
			makeAPIPlan( {
				product_id: 9999,
				product_slug: 'api-only-plan' as PricedAPIPlan[ 'product_slug' ],
			} ),
		] );

		const queryClient = makeQueryClient();
		const { result } = renderHook( () => usePlans( { coupon: undefined } ), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.isError ).toBe( false );
		expect( Object.keys( result.current.data ?? {} ) ).toEqual( [ PLAN_PERSONAL ] );
		expect( result.current.data?.[ PLAN_PERSONAL ].pricing.originalPrice.monthly ).toBe( 1000 );
		expect( queryClient.getQueryData< PricedAPIPlan[] >( [ 'plans', undefined ] ) ).toHaveLength(
			2
		);
	} );

	it( 'ignores API site plans that are not defined in calypso-products', async () => {
		mockWpcomRequest.mockResolvedValue( {
			1001: makeAPISitePlan(),
			9999: makeAPISitePlan( {
				product_slug: 'api-only-plan' as PricedAPISitePlan[ 'product_slug' ],
			} ),
		} );

		const queryClient = makeQueryClient();
		const { result } = renderHook( () => useSitePlans( { coupon: undefined, siteId: 123 } ), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.isError ).toBe( false );
		expect( Object.keys( result.current.data ?? {} ) ).toEqual( [ PLAN_BUSINESS ] );
		expect( result.current.data?.[ PLAN_BUSINESS ].pricing.originalPrice.monthly ).toBe( 2500 );
		expect(
			Object.keys(
				queryClient.getQueryData< Record< string, PricedAPISitePlan > >( [
					'site-plans',
					123,
					undefined,
				] ) ?? {}
			)
		).toEqual( [ '1001', '9999' ] );
	} );
} );
