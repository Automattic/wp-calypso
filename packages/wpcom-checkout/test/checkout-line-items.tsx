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

	describe( 'Tiered Volume Space AddOn', () => {
		const spaceAddOnProduct = {
			...getEmptyResponseCartProduct(),
			product_slug: 'wordpress_com_1gb_space_addon_yearly',
		};

		test( 'should display correct space quantities for new purchase with current quantity as 0', async () => {
			const product = {
				...spaceAddOnProduct,
				quantity: 50,
				current_quantity: 0,
				item_original_subtotal_integer: 1000,
				is_renewal: false,
			};
			const { container } = render( <LineItemSublabelAndPrice product={ product } /> );
			expect( container.innerHTML ).toEqual(
				'50 GB extra space, $10 per year<br>Total extra space after purchase: 50 GB'
			);
		} );

		test( 'should display correct space quantities for new purchase with current quantity > 0', async () => {
			const product = {
				...spaceAddOnProduct,
				quantity: 100,
				current_quantity: 50,
				item_original_subtotal_integer: 1000,
				is_renewal: false,
			};
			const { container } = render( <LineItemSublabelAndPrice product={ product } /> );
			expect( container.innerHTML ).toEqual(
				'50 GB extra space, $10 per year<br>Total extra space after purchase: 100 GB'
			);
		} );

		test( 'should display correct space quantities for renewal purchase', async () => {
			const product = {
				...spaceAddOnProduct,
				quantity: null,
				current_quantity: 50,
				item_original_subtotal_integer: 1000,
				is_renewal: true,
			};
			const { container } = render( <LineItemSublabelAndPrice product={ product } /> );
			expect( container.innerHTML ).toEqual(
				'50 GB extra space, $10 per year<br>Total extra space after purchase: 50 GB'
			);
		} );
	} );

	// The mobile sticky-summary experiment restyles the yearly sublabel and moves
	// the monthly-cycle strikethrough into the main price column. These cover the
	// sublabel side of that split; the price-column side lives in the private
	// LineItemPriceContent.
	describe( 'mobile sticky summary — yearly plan sublabel', () => {
		const yearlyPlan = {
			...getEmptyResponseCartProduct(),
			product_slug: 'value_bundle',
			months_per_bill_period: 12,
			currency: 'USD',
			item_subtotal_integer: 9600,
			item_original_subtotal_integer: 9600,
		};
		// compareToPrice is the monthly-cycle price used for the "vs monthly"
		// comparison; differing from the item's own per-month price is what makes
		// control render a strikethrough.
		const compareToPrice = 1000;

		test( 'control renders the plain "Billed every year" sublabel', () => {
			render(
				<LineItemSublabelAndPrice
					product={ yearlyPlan }
					shouldShowComparison
					compareToPrice={ compareToPrice }
				/>
			);

			expect( screen.getByText( 'Billed every year' ) ).toBeVisible();
		} );

		test( 'treatment renders the annual price in the sublabel instead', () => {
			render(
				<LineItemSublabelAndPrice
					product={ yearlyPlan }
					shouldShowComparison
					compareToPrice={ compareToPrice }
					isMobileCheckoutStickySummary
				/>
			);

			expect( screen.getByText( '$96 billed annually' ) ).toBeVisible();
			expect( screen.queryByText( 'Billed every year' ) ).not.toBeInTheDocument();
		} );

		test( 'control keeps the monthly-cycle strikethrough in the sublabel', () => {
			const { container } = render(
				<LineItemSublabelAndPrice
					product={ yearlyPlan }
					shouldShowComparison
					compareToPrice={ compareToPrice }
				/>
			);

			expect( container.querySelector( 's' ) ).toBeVisible();
		} );

		// Without this gate the strikethrough renders twice under treatment: once
		// here and once inline next to the live price.
		test( 'treatment drops the sublabel strikethrough so it is not shown twice', () => {
			const { container } = render(
				<LineItemSublabelAndPrice
					product={ yearlyPlan }
					shouldShowComparison
					compareToPrice={ compareToPrice }
					isMobileCheckoutStickySummary
				/>
			);

			expect( container.querySelector( 's' ) ).not.toBeInTheDocument();
		} );

		test( 'the renewal-pricing experiment still wins over the treatment sublabel', () => {
			render(
				<LineItemSublabelAndPrice
					product={ yearlyPlan }
					shouldShowComparison
					compareToPrice={ compareToPrice }
					isMobileCheckoutStickySummary
					isRenewalPricingExperiment
				/>
			);

			expect( screen.getByText( /Auto-renews at/ ) ).toBeVisible();
			expect( screen.queryByText( '$96 billed annually' ) ).not.toBeInTheDocument();
		} );
	} );
} );
