/**
 * @jest-environment jsdom
 */

import {
	PRODUCT_1GB_SPACE,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
} from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import * as ProductsList from '../../../products-list';
import * as Site from '../../../site';
import { WOO_BUNDLE_EXTENSIONS_FEATURE } from '../../constants';
import useAddOns from '../use-add-ons';
import type { AnyAddOnMeta } from '../../types';

vi.mock( '../../../products-list', () => ( {
	useProducts: vi.fn(),
} ) );
vi.mock( '../../../site', () => ( {
	useSiteFeatures: vi.fn(),
	useSiteMediaStorage: vi.fn(),
} ) );

const SITE_ID = 123;

const product = ( name: string ) => ( {
	name,
	description: '',
	term: 'year',
	costSmallestUnit: 12000,
	currencyCode: 'USD',
	priceTierList: [],
} );

const pluginAddOns = ( addOns: ( AnyAddOnMeta | null )[] ) =>
	addOns.filter( ( addOn ) => addOn?.pluginSlug );

describe( 'useAddOns', () => {
	beforeEach( () => {
		vi.resetAllMocks();
		( ProductsList.useProducts as Mock ).mockReturnValue( {
			isLoading: false,
			data: {
				[ PRODUCT_WPCOM_UNLIMITED_THEMES ]: product( 'Unlimited Themes' ),
				[ PRODUCT_WPCOM_CUSTOM_DESIGN ]: product( 'Custom Design' ),
				[ PRODUCT_1GB_SPACE ]: product( 'Storage' ),
			},
		} );
		( Site.useSiteMediaStorage as Mock ).mockReturnValue( { isLoading: false } );
	} );

	it( 'returns no plugin add-on for a site without the bundle feature', () => {
		( Site.useSiteFeatures as Mock ).mockReturnValue( { data: { active: [] } } );

		const { result } = renderHook( () =>
			useAddOns( { selectedSiteId: SITE_ID, includePluginAddOns: true } )
		);

		expect( pluginAddOns( result.current ) ).toEqual( [] );
		expect( result.current.some( ( addOn ) => addOn?.productSlug ) ).toBe( true );
	} );

	it( 'does not read site features or return plugin add-ons when the caller does not opt in', () => {
		( Site.useSiteFeatures as Mock ).mockReturnValue( {
			data: { active: [ WOO_BUNDLE_EXTENSIONS_FEATURE ] },
		} );

		const { result } = renderHook( () => useAddOns( { selectedSiteId: SITE_ID } ) );

		expect( pluginAddOns( result.current ) ).toEqual( [] );
		expect( Site.useSiteFeatures ).toHaveBeenCalledWith( { siteIdOrSlug: null } );
	} );

	it( 'returns both plugin add-ons, with no prices and no checkout link, for a site with the bundle feature', () => {
		( Site.useSiteFeatures as Mock ).mockReturnValue( {
			data: { active: [ WOO_BUNDLE_EXTENSIONS_FEATURE ] },
		} );

		const { result } = renderHook( () =>
			useAddOns( { selectedSiteId: SITE_ID, includePluginAddOns: true } )
		);
		const bundleAddOns = pluginAddOns( result.current );

		expect( bundleAddOns.map( ( addOn ) => addOn?.pluginSlug ) ).toEqual( [
			'woocommerce-bookings',
			'woocommerce-subscriptions',
		] );
		bundleAddOns.forEach( ( addOn ) => {
			expect( addOn?.prices ).toBeUndefined();
			expect( addOn?.checkoutLink ).toBeUndefined();
			expect( addOn?.displayCost ).toBeUndefined();
		} );
	} );
} );
