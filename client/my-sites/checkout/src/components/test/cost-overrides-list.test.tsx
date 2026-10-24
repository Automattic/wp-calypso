/**
 * @jest-environment <rootDir>/../test/client/jest-environment-timezone.js
 */

import config from '@automattic/calypso-config';
import { checkoutTheme } from '@automattic/composite-checkout';
import {
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
	ShoppingCartProvider,
} from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import {
	mockGetCartEndpointWith,
	mockSetCartEndpointWith,
} from 'calypso/my-sites/checkout/src/test/util';
import {
	BundleProductAndCostOverridesList,
	ProductsAndCostOverridesList,
} from '../cost-overrides-list';
import { storeData } from './lib/fixtures';
import type {
	ResponseCart,
	ResponseCartCostOverride,
	ResponseCartProduct,
} from '@automattic/shopping-cart';
import type { CartBundleLineItem } from '@automattic/wpcom-checkout';

const mockConfig = config as unknown as { isEnabled: jest.Mock };
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

function buildDomainProduct( overrides: {
	uuid: string;
	meta: string;
	subtotal: number;
	originalSubtotal?: number;
	costOverrides?: ResponseCartCostOverride[];
	extra?: ResponseCartProduct[ 'extra' ];
} ) {
	return {
		...getEmptyResponseCartProduct(),
		product_slug: 'domain_reg',
		is_domain_registration: true,
		uuid: overrides.uuid,
		meta: overrides.meta,
		item_subtotal_integer: overrides.subtotal,
		item_original_subtotal_integer: overrides.originalSubtotal ?? overrides.subtotal,
		cost_overrides: overrides.costOverrides ?? [],
		extra: overrides.extra ?? {},
	};
}

function buildCouponOverride( oldSubtotal: number, newSubtotal: number ): ResponseCartCostOverride {
	return {
		human_readable_reason: 'Coupon',
		override_code: 'coupon-discount',
		old_subtotal_integer: oldSubtotal,
		new_subtotal_integer: newSubtotal,
		does_override_original_cost: false,
		percentage: 0,
		first_unit_only: false,
	};
}

const bundle: CartBundleLineItem = {
	type: 'bundle',
	groupId: 'bundle-abc',
	products: [
		buildDomainProduct( { uuid: 'primary', meta: 'example.com', subtotal: 2200 } ),
		buildDomainProduct( { uuid: 'companion', meta: 'example.net', subtotal: 1800 } ),
	],
};

function renderBundleRow( bundleToRender: CartBundleLineItem = bundle ) {
	return render(
		<ThemeProvider theme={ checkoutTheme }>
			<BundleProductAndCostOverridesList bundle={ bundleToRender } />
		</ThemeProvider>
	);
}

describe( 'BundleProductAndCostOverridesList', () => {
	it( 'renders the bundle label, each member domain, and the summed total', () => {
		renderBundleRow();

		expect( screen.getByText( 'Domain Bundle' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
		// 2200 + 1800 = 4000 smallest-unit => $40.
		expect( screen.getByText( /\$40\b/ ) ).toBeVisible();
		expect( screen.queryByText( /\$22\b/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /\$18\b/ ) ).not.toBeInTheDocument();
	} );

	it( 'shows pre-coupon prices so the dedicated coupon line is not double-counted', () => {
		// The companion carries a $2 coupon discount: its item_subtotal_integer is
		// already reduced to 1800, but the order summary renders coupon savings on a
		// separate line, so the bundle must display the pre-coupon 2000.
		renderBundleRow( {
			type: 'bundle',
			groupId: 'bundle-coupon',
			products: [
				buildDomainProduct( { uuid: 'primary', meta: 'example.com', subtotal: 2200 } ),
				buildDomainProduct( {
					uuid: 'companion',
					meta: 'example.net',
					subtotal: 1800,
					costOverrides: [ buildCouponOverride( 2000, 1800 ) ],
				} ),
			],
		} );

		// Companion price is included in the grouped total, not shown as a separate row.
		expect( screen.queryByText( /\$20\b/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /\$18\b/ ) ).not.toBeInTheDocument();
		// 2200 + 2000 = 4200 smallest-unit => $42.
		expect( screen.getByText( /\$42\b/ ) ).toBeVisible();
	} );
	it( 'shows the summed original price crossed out when the bundle is discounted', () => {
		renderBundleRow( {
			type: 'bundle',
			groupId: 'bundle-discounted',
			products: [
				buildDomainProduct( {
					uuid: 'primary',
					meta: 'example.com',
					subtotal: 2200,
					originalSubtotal: 6500,
				} ),
				buildDomainProduct( {
					uuid: 'companion',
					meta: 'example.net',
					subtotal: 700,
					originalSubtotal: 6400,
				} ),
			],
		} );

		expect( screen.getByText( /\$29\b/ ) ).toBeVisible();
		const crossedOut = screen.getByText( /\$129\b/ );
		expect( crossedOut ).toBeVisible();
		expect( crossedOut.tagName ).toBe( 'S' );
	} );
} );

function buildCartWithBundle(): ResponseCart {
	return {
		...getEmptyResponseCart(),
		products: [
			buildDomainProduct( {
				uuid: 'primary',
				meta: 'example.com',
				subtotal: 2200,
				extra: { domain_bundle_group_id: 'group-1', domain_bundle_role: 'primary' },
			} ),
			buildDomainProduct( {
				uuid: 'companion',
				meta: 'example.net',
				subtotal: 1800,
				extra: { domain_bundle_group_id: 'group-1', domain_bundle_role: 'companion' },
			} ),
		],
	};
}

function TestWrapper( {
	children,
	initialCart,
}: {
	children: React.ReactNode;
	initialCart: ResponseCart;
} ) {
	const [ reduxStore ] = useState( () => applyMiddleware( thunk )( createStore )( storeData ) );
	const [ queryClient ] = useState( () => new QueryClient() );
	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );
	const managerClient = createShoppingCartManagerClient( {
		getCart: mockGetCartEndpointWith( initialCart ),
		setCart: mockSetCartEndpoint,
	} );
	return (
		<ReduxProvider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<ShoppingCartProvider managerClient={ managerClient }>
					<ThemeProvider theme={ checkoutTheme }>{ children }</ThemeProvider>
				</ShoppingCartProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}

describe( 'ProductsAndCostOverridesList', () => {
	afterEach( () => {
		mockConfig.isEnabled.mockRestore();
	} );

	it( 'groups bundle-tagged products into a single bundle row when the flag is on', () => {
		mockConfig.isEnabled.mockImplementation( ( flag ) => flag === 'domain-bundling' );
		const responseCart = buildCartWithBundle();

		render(
			<TestWrapper initialCart={ responseCart }>
				<ProductsAndCostOverridesList responseCart={ responseCart } />
			</TestWrapper>
		);

		expect( screen.getByText( 'Domain Bundle' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
	} );

	it( 'renders each product on its own line when the flag is off', () => {
		mockConfig.isEnabled.mockImplementation( () => false );
		const responseCart = buildCartWithBundle();

		render(
			<TestWrapper initialCart={ responseCart }>
				<ProductsAndCostOverridesList responseCart={ responseCart } />
			</TestWrapper>
		);

		expect( screen.queryByText( 'Domain Bundle' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'example.net' ) ).toBeVisible();
	} );
} );

describe( 'Intro offer due date', () => {
	const originalTZ = process.env.TZ;

	beforeAll( () => {
		// A UTC-midnight date renders a day early behind UTC unless parsed as a calendar date.
		process.env.TZ = 'America/New_York';
	} );

	afterAll( () => {
		if ( originalTZ === undefined ) {
			delete process.env.TZ;
		} else {
			process.env.TZ = originalTZ;
		}
	} );

	afterEach( () => {
		mockConfig.isEnabled.mockRestore();
	} );

	function buildCartWithTrial(): ResponseCart {
		return {
			...getEmptyResponseCart(),
			currency: 'USD',
			products: [
				{
					...getEmptyResponseCartProduct(),
					product_id: 401,
					product_slug: 'wp_titan_mail_yearly',
					product_name: 'Professional Email',
					meta: 'example.com',
					uuid: 'titan',
					months_per_bill_period: 12,
					item_subtotal_integer: 0,
					item_original_subtotal_integer: 3500,
					introductory_offer_terms: {
						enabled: true,
						interval_unit: 'month',
						interval_count: 3,
						transition_after_renewal_count: 0,
						should_prorate_when_offer_ends: false,
					},
					cost_overrides: [
						{
							human_readable_reason: 'Introductory offer',
							override_code: 'introductory-offer',
							old_subtotal_integer: 3500,
							new_subtotal_integer: 0,
							does_override_original_cost: false,
							percentage: 100,
							first_unit_only: false,
						},
					],
				},
			],
			terms_of_service: [
				{
					key: 'product_id:401,meta:example.com',
					code: 'introductory_offer_trial',
					args: {
						product_id: 401,
						product_meta: 'example.com',
						product_name: 'Professional Email',
						renewal_price: '$35',
						regular_renewal_price: '$35',
						is_renewal: false,
						subscription_start_date: '2026-10-22T00:00:00+00:00',
						subscription_end_of_promotion_date: '2027-01-22T00:00:00+00:00',
						subscription_auto_renew_date: '2027-01-22T00:00:00+00:00',
						subscription_regular_auto_renew_date: '2028-01-22T00:00:00+00:00',
						subscription_expiry_date: '2027-01-22T00:00:00+00:00',
						subscription_pre_renew_reminder_days: 7,
						subscription_pre_renew_reminders_count: 1,
						renewal_price_integer: 3500,
						regular_renewal_price_integer: 3500,
						maybe_prorated_regular_renewal_price_integer: 3500,
						subscription_maybe_prorated_regular_auto_renew_date: '2027-01-22T00:00:00+00:00',
						remaining_promotional_auto_renewals: 0,
					},
				},
			],
		};
	}

	it( 'shows the billed date on the right calendar day', async () => {
		mockConfig.isEnabled.mockImplementation( () => false );
		const responseCart = buildCartWithTrial();

		render(
			<TestWrapper initialCart={ responseCart }>
				<ProductsAndCostOverridesList responseCart={ responseCart } />
			</TestWrapper>
		);

		expect( await screen.findByText( /Billed Jan 22, 2027/ ) ).toBeVisible();
	} );
} );
