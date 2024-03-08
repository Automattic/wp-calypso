import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LineItemSublabelAndPrice } from '../src/checkout-line-items';

describe( 'LineItemSublabelAndPrice', () => {
	describe( 'DIFM product', () => {
		const emptyDIFMProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: 'wp_difm_lite',
			bill_period: '-1',
		};
		const difmProductWithoutTieredPricing = {
			...emptyDIFMProduct,
			price_tier_maximum_units: null,
			quantity: null,
		};

		const difmProductWithLessThanFiveExtraPages = {
			...emptyDIFMProduct,
			price_tier_maximum_units: 5,
			quantity: 4,
		};

		const difmProductWithMoreThanFiveExtraPagesSingular = {
			...emptyDIFMProduct,
			price_tier_maximum_units: 5,
			quantity: 6,
			item_original_cost_integer: 49900 + ( 6 - 5 ) * 6900,
			item_original_cost_for_quantity_one_integer: 49900,
		};

		const difmProductWithMoreThanFiveExtraPagesPlural = {
			...emptyDIFMProduct,
			price_tier_maximum_units: 5,
			quantity: 7,
			item_original_cost_integer: 49900 + ( 7 - 5 ) * 6900,
			item_original_cost_for_quantity_one_integer: 49900,
		};

		test( 'should return null if product does not support tiered pricing', async () => {
			const { container } = render(
				<LineItemSublabelAndPrice product={ difmProductWithoutTieredPricing } />
			);
			expect( container.innerHTML ).toEqual( '' );
		} );

		test( 'should return empty fragment if the number of selected pages is less than the tier maximum', async () => {
			const { container } = render(
				<LineItemSublabelAndPrice product={ difmProductWithLessThanFiveExtraPages } />
			);
			expect( container.innerHTML ).toEqual( '' );
		} );

		test( 'should return the sublabel if the number of selected pages is more than the tier maximum (singular)', async () => {
			render(
				<LineItemSublabelAndPrice product={ difmProductWithMoreThanFiveExtraPagesSingular } />
			);
			expect( screen.getByText( /Service/i ) ).toHaveTextContent(
				'Service: $499 one-time fee1 Extra Page: $69 one-time fee' // The <br> tag is ignored here
			);
		} );

		test( 'should return the sublabel if the number of selected pages is more than the tier maximum (plural)', async () => {
			render(
				<LineItemSublabelAndPrice product={ difmProductWithMoreThanFiveExtraPagesPlural } />
			);
			expect( screen.getByText( /Service/i ) ).toHaveTextContent(
				'Service: $499 one-time fee2 Extra Pages: $138 one-time fee' // The <br> tag is ignored here
			);
		} );
	} );
} );
