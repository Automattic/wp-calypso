import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { shallow } from 'enzyme';
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
			item_original_cost_for_quantity_one_display: '$499',
		};

		const difmProductWithMoreThanFiveExtraPagesPlural = {
			...emptyDIFMProduct,
			price_tier_maximum_units: 5,
			quantity: 7,
			item_original_cost_integer: 49900 + ( 7 - 5 ) * 6900,
			item_original_cost_for_quantity_one_integer: 49900,
			item_original_cost_for_quantity_one_display: '$499',
		};

		test( 'should return null if product does not support tiered pricing', () => {
			const wrapper = shallow(
				<LineItemSublabelAndPrice product={ difmProductWithoutTieredPricing } />
			);
			expect( wrapper.html() ).toEqual( '' );
		} );

		test( 'should return empty fragment if the number of selected pages is less than the tier maximum', () => {
			const wrapper = shallow(
				<LineItemSublabelAndPrice product={ difmProductWithLessThanFiveExtraPages } />
			);
			expect( wrapper.html() ).toEqual( '' );
		} );

		test( 'should return the sublabel if the number of selected pages is more than the tier maximum (singular)', () => {
			const wrapper = shallow(
				<LineItemSublabelAndPrice product={ difmProductWithMoreThanFiveExtraPagesSingular } />
			);
			expect( wrapper.html() ).toEqual(
				'Service: $499 one-time fee<br/>1 Extra Page: $69 one-time fee'
			);
		} );

		test( 'should return the sublabel if the number of selected pages is more than the tier maximum (plural)', () => {
			const wrapper = shallow(
				<LineItemSublabelAndPrice product={ difmProductWithMoreThanFiveExtraPagesPlural } />
			);
			expect( wrapper.html() ).toEqual(
				'Service: $499 one-time fee<br/>2 Extra Pages: $138 one-time fee'
			);
		} );
	} );
} );
