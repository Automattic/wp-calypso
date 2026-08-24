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

const renderProductsList = (
	products,
	subscriptionOptions = null,
	freeTierDescriptionRendered = null,
	supportsFreeTier = true
) =>
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
				settings: {},
			},
			// Provide a complete site-settings slice (items + requesting + saveRequests).
			// `requesting: { 1: true }` makes QuerySiteSettings treat the fetch as
			// already in-flight so it doesn't trigger a real network request in tests.
			// The Free tier's server-rendered markdown is colocated here with
			// subscription_options (it's returned by the site-settings endpoint).
			siteSettings: {
				items: {
					1: {
						...( subscriptionOptions ? { subscription_options: subscriptionOptions } : {} ),
						...( supportsFreeTier ? { supports_free_tier_customization: true } : {} ),
						...( freeTierDescriptionRendered
							? { free_tier_description_rendered: freeTierDescriptionRendered }
							: {} ),
					},
				},
				requesting: { 1: true },
				saveRequests: {},
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

	test( 'shows the Free row when at least one newsletter tier exists', () => {
		renderProductsList( [ tierWithoutDescription ] );

		// The Free row contributes both a title and a price reading "Free".
		expect( screen.getAllByText( 'Free' ).length ).toBeGreaterThan( 0 );
	} );

	test( 'does not show the Free row when no newsletter tier exists', () => {
		renderProductsList( [ donationPlan ] );

		expect( screen.getByText( 'One-time Donation' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Free' ) ).not.toBeInTheDocument();
	} );

	test( 'does not show the Free row when the site does not support free tier customization', () => {
		// A newsletter tier exists, but the capability flag is absent (older Jetpack),
		// so saving the free-tier settings would silently no-op — hide the row.
		renderProductsList( [ tierWithoutDescription ], null, null, false );

		expect( screen.getByText( 'Basic Tier' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Free' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the custom free tier description preview', () => {
		renderProductsList( [ tierWithoutDescription ], {
			free_tier_description: 'A free taste of the newsletter',
		} );

		expect( screen.getByText( 'A free taste of the newsletter' ) ).toBeInTheDocument();
	} );

	test( 'renders the server-rendered free tier description HTML when provided', () => {
		const { container } = renderProductsList(
			[ tierWithoutDescription ],
			{ free_tier_description: 'Includes:\n\n- Weekly posts' },
			'<p>Includes:</p>\n<ul>\n<li>Weekly posts</li>\n</ul>'
		);

		const description = container.querySelector( '.memberships__products-product-description' );
		expect( description.querySelector( 'ul li' ) ).toHaveTextContent( 'Weekly posts' );
		// The raw markdown source must not leak through when rendered HTML exists.
		expect( description ).not.toHaveTextContent( '- Weekly posts' );
	} );

	test( 'sanitizes the free tier rendered HTML, keeping target="_blank" and stripping unsafe markup', () => {
		const { container } = renderProductsList(
			[ tierWithoutDescription ], // No paid description, so the only description container is the Free row's.
			{ free_tier_description: '[Learn more](https://example.com)' },
			'<p><a href="https://example.com" target="_blank" rel="noopener">Learn more</a></p>' +
				'<script>alert(1)</script><p onclick="alert(1)">unsafe</p>'
		);

		const description = container.querySelector( '.memberships__products-product-description' );
		const link = description.querySelector( 'a' );
		// target="_blank" must survive sanitization — links escape the page context.
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener' );
		// ...while DOMPurify still strips unsafe markup.
		expect( description.querySelector( 'script' ) ).toBeNull();
		expect( description.innerHTML ).not.toContain( 'onclick' );
	} );

	test( 'marks the Free row as hidden when hide_free_tier is set', () => {
		renderProductsList( [ tierWithoutDescription ], { hide_free_tier: true } );

		expect( screen.getByText( 'Hidden from subscribers' ) ).toBeInTheDocument();
	} );
} );
