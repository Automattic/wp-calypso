/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
/* eslint-disable import/order */
import { type Mock, vi } from 'vitest';
vi.mock( '@wordpress/data', () => ( {
	useSelect: vi.fn(),
	combineReducers: vi.fn(),
	createReduxStore: vi.fn(),
	createSelector: vi.fn(),
	register: vi.fn(),
	registerStore: vi.fn(),
} ) );
vi.mock( '@automattic/data-stores', () => ( {
	AddOns: {
		useStorageAddOns: vi.fn(),
	},
	Purchases: {
		useSitePurchasesByProductSlug: vi.fn(),
	},
	WpcomPlansUI: {
		store: null,
	},
} ) );
vi.mock( '../../grid-context', () => ( { usePlansGridContext: vi.fn() } ) );
vi.mock( '../../hooks/use-is-large-currency', () => ( { default: vi.fn() } ) );

import { FEATURE_50GB_STORAGE, PLAN_BUSINESS } from '@automattic/calypso-products';
import { AddOns, Purchases } from '@automattic/data-stores';
import { render } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import React from 'react';
import { usePlansGridContext } from '../../grid-context';
import useIsLargeCurrency from '../../hooks/use-is-large-currency';
import StorageFeatureLabel from '../shared/storage/components/storage-feature-label';

describe( 'StorageFeatureLabel', () => {
	const selectedStorageAddOn = {
		addOnSlug: 'add-on-100gb-storage',
		quantity: 100,
		prices: {
			monthlyPrice: 1000,
		},
	};

	beforeEach( () => {
		vi.clearAllMocks();
		( AddOns.useStorageAddOns as Mock ).mockReturnValue( [ selectedStorageAddOn ] );
		( Purchases.useSitePurchasesByProductSlug as Mock ).mockReturnValue( null );
		( useSelect as Mock ).mockReturnValue( selectedStorageAddOn.addOnSlug );
		( useIsLargeCurrency as Mock ).mockReturnValue( false );
	} );

	const mockPlansGridContext = ( showFeatureCheckmarks: boolean ) => {
		( usePlansGridContext as Mock ).mockReturnValue( {
			gridPlansIndex: {
				[ PLAN_BUSINESS ]: {
					pricing: {
						currencyCode: 'USD',
					},
					features: {
						storageFeature: {
							getSlug: () => FEATURE_50GB_STORAGE,
						},
					},
				},
			},
			showFeatureCheckmarks,
			siteId: 1,
		} );
	};

	test( 'ignores selected but unpurchased storage add-ons outside the redesign', () => {
		mockPlansGridContext( false );

		const { container } = render( <StorageFeatureLabel planSlug={ PLAN_BUSINESS } /> );

		expect( container ).toHaveTextContent( '50 GB' );
		expect( container ).not.toHaveTextContent( '150 GB' );
		expect( container ).not.toHaveTextContent( '+ $10/month' );
	} );

	test( 'shows selected storage add-ons in the redesign collapsed label', () => {
		mockPlansGridContext( true );

		const { container } = render( <StorageFeatureLabel planSlug={ PLAN_BUSINESS } showAddMore /> );

		expect( container ).toHaveTextContent( '150 GB storage' );
		expect( container ).toHaveTextContent( 'Add more' );
		expect( container ).toHaveTextContent( '+ $10.00/month' );
	} );
} );
