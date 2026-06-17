/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen } from '@testing-library/react';
import membershipsReducer from 'calypso/state/memberships/reducer';
import siteSettingsReducer from 'calypso/state/site-settings/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from '../../../../test-helpers/testing-library';
import { TYPE_TIER } from '../constants';
import ProductsList from '../products-list';

const productData = {
	currency: 'USD',
	buyer_can_change_amount: false,
	multiple_per_user: false,
	welcome_email_content: 'Welcome!',
	subscribe_as_site_subscriber: true,
	is_editable: true,
};

const tierWithDescription = {
	...productData,
	ID: 9,
	price: 5,
	title: 'Premium Tier',
	description: 'Full archive access and community Q&A',
	type: TYPE_TIER,
	interval: '1 month',
	renewal_schedule: '1 month',
};

const tierWithoutDescription = {
	...productData,
	ID: 10,
	price: 3,
	title: 'Basic Tier',
	type: TYPE_TIER,
	interval: '1 month',
	renewal_schedule: '1 month',
};

const donationPlan = {
	...productData,
	ID: 11,
	price: 10,
	title: 'One-time Donation',
	description: 'Should not appear in the list',
	type: 'donation',
	interval: '1 month',
	renewal_schedule: '1 month',
};

const initialState = {
	sites: { items: { 1: { ID: 1 } }, features: { 1: { data: { active: [ 'donations' ] } } } },
	ui: { selectedSiteId: 1 },
	memberships: {
		productList: {
			items: {},
		},
		settings: {},
	},
};

const renderProductsList = ( products ) =>
	renderWithProvider( <ProductsList />, {
		initialState: {
			...initialState,
			memberships: {
				...initialState.memberships,
				productList: {
					items: {
						1: products,
					},
				},
			},
		},
		reducers: {
			ui: uiReducer,
			memberships: membershipsReducer,
			siteSettings: siteSettingsReducer,
		},
	} );

describe( 'ProductsList', () => {
	test( 'renders tier descriptions when provided', () => {
		renderProductsList( [ tierWithDescription, tierWithoutDescription, donationPlan ] );

		expect( screen.getByText( 'Premium Tier' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Full archive access and community Q&A' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Basic Tier' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Should not appear in the list' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render description container for tiers without a description', () => {
		const { container } = renderProductsList( [ tierWithoutDescription ] );

		expect( screen.getByText( 'Basic Tier' ) ).toBeInTheDocument();
		expect( container.querySelector( '.memberships__products-product-description' ) ).toBeNull();
	} );

	test( 'renders the server-rendered markdown HTML when provided', () => {
		const { container } = renderProductsList( [
			{
				...tierWithDescription,
				description: 'Includes:\n\n- Full archive\n- **Bonus** newsletters',
				description_rendered:
					'<p>Includes:</p>\n<ul>\n<li>Full archive</li>\n<li><strong>Bonus</strong> newsletters</li>\n</ul>',
			},
		] );

		const description = container.querySelector( '.memberships__products-product-description' );
		const items = description.querySelectorAll( 'ul li' );
		expect( items ).toHaveLength( 2 );
		expect( items[ 0 ] ).toHaveTextContent( 'Full archive' );
		expect( description.querySelector( 'strong' ) ).toHaveTextContent( 'Bonus' );
	} );

	test( 'preserves the server-added target="_blank" on links while stripping unsafe markup', () => {
		const { container } = renderProductsList( [
			{
				...tierWithDescription,
				description: '[Learn more](https://example.com)',
				description_rendered:
					'<p><a href="https://example.com" target="_blank" rel="noopener">Learn more</a></p>' +
					'<script>alert(1)</script><p onclick="alert(1)">unsafe</p>',
			},
		] );

		const description = container.querySelector( '.memberships__products-product-description' );
		const link = description.querySelector( 'a' );
		// target="_blank" must survive sanitization — links escape the page context.
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener' );
		// ...while DOMPurify still strips unsafe markup.
		expect( description.querySelector( 'script' ) ).toBeNull();
		expect( description.innerHTML ).not.toContain( 'onclick' );
	} );

	test( 'falls back to the raw description as plain text when no rendered HTML is provided', () => {
		const { container } = renderProductsList( [
			{
				...tierWithDescription,
				description: '**not parsed** <img src="x"> plain text',
				description_rendered: undefined,
			},
		] );

		const description = container.querySelector( '.memberships__products-product-description' );
		// Raw description renders as inert text — no markdown parsing, no HTML.
		expect( description.querySelector( 'img' ) ).toBeNull();
		expect( description.querySelector( 'strong' ) ).toBeNull();
		expect( description ).toHaveTextContent( '**not parsed** <img src="x"> plain text' );
	} );
} );
