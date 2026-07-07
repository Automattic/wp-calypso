/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	createSelector: jest.fn(),
	register: jest.fn(),
	registerStore: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	AddOns: {
		useStorageAddOns: jest.fn(),
	},
	Purchases: {
		useSitePurchasesByProductSlug: jest.fn(),
	},
	WpcomPlansUI: {
		store: null,
	},
} ) );
jest.mock( '../../grid-context', () => ( { usePlansGridContext: jest.fn() } ) );
jest.mock( '../../hooks/use-is-large-currency', () => jest.fn() );

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
		jest.clearAllMocks();
		( AddOns.useStorageAddOns as jest.Mock ).mockReturnValue( [ selectedStorageAddOn ] );
		( Purchases.useSitePurchasesByProductSlug as jest.Mock ).mockReturnValue( null );
		( useSelect as jest.Mock ).mockReturnValue( selectedStorageAddOn.addOnSlug );
		( useIsLargeCurrency as jest.Mock ).mockReturnValue( false );
	} );

	const mockPlansGridContext = ( showFeatureCheckmarks: boolean ) => {
		( usePlansGridContext as jest.Mock ).mockReturnValue( {
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
