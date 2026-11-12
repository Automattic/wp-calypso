/**
 * @jest-environment jsdom
 */

const mockComboboxClick = vi.fn();
const mockSetSelectedStorageOptionForPlan = vi.fn();

vi.mock( '@wordpress/components', async () => {
	const ReactActual = await vi.importActual< typeof import( 'react' ) >( 'react' );

	return {
		CustomSelectControl: ( { label }: { label: string } ) =>
			ReactActual.createElement(
				'button',
				{
					'aria-label': label,
					onClick: mockComboboxClick,
					role: 'combobox',
					type: 'button',
				},
				'Storage options'
			),
	};
} );
vi.mock( '@automattic/calypso-products', () => ( {
	FEATURE_1GB_STORAGE: '1gb-storage',
	FEATURE_6GB_STORAGE: '6gb-storage',
	FEATURE_13GB_STORAGE: '13gb-storage',
	FEATURE_50GB_STORAGE: '50gb-storage',
	FEATURE_100GB_STORAGE: '100gb-storage',
	FEATURE_200GB_STORAGE: '200gb-storage',
	FEATURE_P2_3GB_STORAGE: 'p2-3gb-storage',
	FEATURE_P2_13GB_STORAGE: 'p2-13gb-storage',
	PLAN_BUSINESS: 'business-bundle',
	PLAN_ECOMMERCE: 'ecommerce-bundle',
	PRODUCT_1GB_SPACE: '1gb-space',
} ) );
vi.mock( '@wordpress/data', () => ( {
	useDispatch: vi.fn( () => ( {
		setSelectedStorageOptionForPlan: mockSetSelectedStorageOptionForPlan,
	} ) ),
	useSelect: vi.fn(),
} ) );
vi.mock( '@automattic/data-stores', () => ( {
	AddOns: {
		useAvailableStorageAddOns: vi.fn(),
		useStorageAddOns: vi.fn(),
	},
	Purchases: {
		useSitePurchasesByProductSlug: vi.fn(),
	},
	WpcomPlansUI: {
		store: {},
	},
} ) );
vi.mock( '../../grid-context', () => ( { usePlansGridContext: vi.fn() } ) );

import { FEATURE_50GB_STORAGE, PLAN_BUSINESS } from '@automattic/calypso-products';
import { AddOns, Purchases } from '@automattic/data-stores';
import { render } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import React from 'react';
import { type Mock, vi } from 'vitest';
import { usePlansGridContext } from '../../grid-context';
import StorageDropdown from '../shared/storage/components/storage-dropdown';

describe( 'StorageDropdown', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		( AddOns.useStorageAddOns as Mock ).mockReturnValue( [] );
		( AddOns.useAvailableStorageAddOns as Mock ).mockReturnValue( [
			{
				addOnSlug: 'add-on-100gb-storage',
				prices: { formattedMonthlyPrice: '$10' },
				quantity: 100,
			},
		] );
		( Purchases.useSitePurchasesByProductSlug as Mock ).mockReturnValue( null );
		( useSelect as Mock ).mockReturnValue( FEATURE_50GB_STORAGE );
		( usePlansGridContext as Mock ).mockReturnValue( {
			gridPlansIndex: {
				[ PLAN_BUSINESS ]: {
					features: {
						storageFeature: {
							getSlug: () => FEATURE_50GB_STORAGE,
						},
					},
				},
			},
			siteId: 1,
		} );
	} );

	test( 'opens the select control after mounting when requested', async () => {
		render( <StorageDropdown planSlug={ PLAN_BUSINESS } openOnMount /> );

		await new Promise( ( resolve ) => window.setTimeout( resolve, 0 ) );

		expect( mockComboboxClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does not open the select control after mounting by default', async () => {
		render( <StorageDropdown planSlug={ PLAN_BUSINESS } /> );

		await new Promise( ( resolve ) => window.setTimeout( resolve, 0 ) );

		expect( mockComboboxClick ).not.toHaveBeenCalled();
	} );
} );
