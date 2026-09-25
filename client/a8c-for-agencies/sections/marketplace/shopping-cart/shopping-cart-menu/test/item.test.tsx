/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ShoppingCartMenuItem from '../item';
import type { ShoppingCartItem } from '../../../types';

jest.mock( 'calypso/state/products-list/selectors', () => ( {
	getProductsList: () => ( {} ),
} ) );

jest.mock( '../../../hooks/use-marketplace', () => ( {
	useGetProductPricingInfo: () => ( {
		getProductPricingInfo: () => ( {
			showActualCost: false,
			discountedCostFormatted: '$10',
			actualCostFormatted: '$10',
			isFree: false,
		} ),
	} ),
	useTermPricingText: () => '/mo',
	checkProductTermAvailability: () => ( { isMissingMonthlyId: false, isMissingYearlyId: false } ),
} ) );

const item: ShoppingCartItem = {
	name: 'Jetpack Backup',
	slug: 'jetpack-backup',
	product_id: 2100,
	currency: 'USD',
	amount: '10',
	price_interval: 'day',
	family_slug: 'jetpack-packs',
	supported_bundles: [],
	quantity: 1,
};

const renderItem = ( ui: React.ReactElement ) => renderWithProvider( ui );

describe( 'ShoppingCartMenuItem quantity stepper', () => {
	it( 'renders the copy count when increment/decrement handlers are provided', () => {
		renderItem(
			<ShoppingCartMenuItem
				item={ item }
				count={ 3 }
				onIncrementItem={ jest.fn() }
				onDecrementItem={ jest.fn() }
			/>
		);

		expect( screen.getByText( '3' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Add one' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Remove one' ) ).toBeVisible();
	} );

	it( 'calls onIncrementItem when the add button is clicked', async () => {
		const onIncrementItem = jest.fn();
		renderItem(
			<ShoppingCartMenuItem
				item={ item }
				count={ 1 }
				onIncrementItem={ onIncrementItem }
				onDecrementItem={ jest.fn() }
			/>
		);

		await userEvent.click( screen.getByLabelText( 'Add one' ) );
		expect( onIncrementItem ).toHaveBeenCalledWith( item );
	} );

	it( 'calls onDecrementItem when the remove-one button is clicked', async () => {
		const onDecrementItem = jest.fn();
		renderItem(
			<ShoppingCartMenuItem
				item={ item }
				count={ 2 }
				onIncrementItem={ jest.fn() }
				onDecrementItem={ onDecrementItem }
			/>
		);

		await userEvent.click( screen.getByLabelText( 'Remove one' ) );
		expect( onDecrementItem ).toHaveBeenCalledWith( item );
	} );

	it( 'does not render the stepper without increment/decrement handlers', () => {
		renderItem( <ShoppingCartMenuItem item={ item } onRemoveItem={ jest.fn() } /> );

		expect( screen.queryByLabelText( 'Add one' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Remove' ) ).toBeVisible();
	} );

	it( 'disables the add button once the maximum copy count is reached', () => {
		renderItem(
			<ShoppingCartMenuItem
				item={ item }
				count={ 10 }
				onIncrementItem={ jest.fn() }
				onDecrementItem={ jest.fn() }
			/>
		);

		expect( screen.getByLabelText( 'Add one' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Remove one' ) ).toBeEnabled();
	} );

	it( 'hides the stepper for Pressable RAM addons, which are purchased once', () => {
		const addon: ShoppingCartItem = {
			...item,
			name: 'Pressable RAM addon',
			slug: 'pressable-addon-php-memory-2gb',
			site_domain: 'example.com',
		};

		renderItem(
			<ShoppingCartMenuItem
				item={ addon }
				count={ 1 }
				onIncrementItem={ jest.fn() }
				onDecrementItem={ jest.fn() }
				onRemoveItem={ jest.fn() }
			/>
		);

		expect( screen.queryByLabelText( 'Add one' ) ).not.toBeInTheDocument();
		expect( screen.queryByLabelText( 'Remove one' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Remove' ) ).toBeVisible();
	} );
} );
