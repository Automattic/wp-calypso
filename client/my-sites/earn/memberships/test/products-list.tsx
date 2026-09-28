/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from 'react-modal';
import wpcom from 'calypso/lib/wp';
import membershipsReducer from 'calypso/state/memberships/reducer';
import siteSettingsReducer from 'calypso/state/site-settings/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from '../../../../test-helpers/testing-library';
import { TYPE_TIER } from '../constants';
import RecurringPaymentsPlanDeleteModal from '../delete-plan-modal';
import ProductsList from '../products-list';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

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

const annualTier = {
	...tierWithoutDescription,
	ID: 12,
	tier: tierWithoutDescription.ID,
	price: 30,
	title: 'Annual Tier',
	interval: '1 year',
	renewal_schedule: '1 year',
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
	let modalRoot;

	beforeEach( () => {
		wpcom.req.post.mockReset();
		modalRoot = document.createElement( 'div' );
		document.body.appendChild( modalRoot );
		Modal.setAppElement( modalRoot );
	} );

	afterEach( () => {
		modalRoot.remove();
	} );

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

	test( 'shows a read-only plan without management actions and explains it on hover', async () => {
		const user = userEvent.setup();
		renderProductsList( [ { ...tierWithoutDescription, is_read_only: true } ] );
		const plan = within( screen.getByText( 'Basic Tier' ).closest( '.card' ) );
		const badge = plan.getByText( 'Read-only' );

		expect( badge ).toBeVisible();
		expect( screen.queryByText( 'Managed on the owning site.' ) ).not.toBeInTheDocument();
		expect( plan.queryByTitle( 'Toggle menu' ) ).not.toBeInTheDocument();

		await user.hover( badge );

		expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent(
			'Managed on the owning site.'
		);
		expect( badge ).toHaveAccessibleDescription( 'Managed on the owning site.' );
	} );

	test( 'explains read-only status on keyboard focus and dismisses it with Escape', async () => {
		const user = userEvent.setup();
		renderProductsList( [ { ...donationPlan, is_read_only: true } ] );
		const badge = screen.getByText( 'Read-only' );

		await user.tab();
		await user.tab();

		expect( badge ).toHaveFocus();
		expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent(
			'Managed on the owning site.'
		);
		expect( badge ).toHaveAccessibleDescription( 'Managed on the owning site.' );

		await user.keyboard( '{Escape}' );

		await waitFor( () => expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument() );
	} );

	test.each( [ false, undefined ] )(
		'keeps management actions with is_read_only=%s',
		async ( isReadOnly ) => {
			const user = userEvent.setup();
			renderProductsList( [ { ...tierWithoutDescription, is_read_only: isReadOnly } ] );
			const plan = within( screen.getByText( 'Basic Tier' ).closest( '.card' ) );

			await user.click( plan.getByTitle( 'Toggle menu' ) );

			expect( screen.getByText( 'Edit' ) ).toBeVisible();
			expect( screen.getByText( 'Delete' ) ).toBeVisible();
			expect( plan.queryByText( 'Read-only' ) ).not.toBeInTheDocument();
		}
	);

	test.each( [
		[ true, false ],
		[ false, true ],
		[ true, true ],
	] )(
		'does not offer combined management with monthly=%s and annual=%s read-only',
		( monthlyReadOnly, annualReadOnly ) => {
			renderProductsList( [
				{ ...tierWithoutDescription, is_read_only: monthlyReadOnly },
				{ ...annualTier, is_read_only: annualReadOnly },
			] );
			const plan = within( screen.getByText( 'Basic Tier' ).closest( '.card' ) );

			expect( plan.getByText( 'Read-only' ) ).toBeVisible();
			expect( plan.queryByTitle( 'Toggle menu' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Annual Tier' ) ).not.toBeInTheDocument();
		}
	);

	test( 'keeps management actions for a writable paired offering', async () => {
		const user = userEvent.setup();
		renderProductsList( [ tierWithoutDescription, annualTier ] );
		const plan = within( screen.getByText( 'Basic Tier' ).closest( '.card' ) );

		await user.click( plan.getByTitle( 'Toggle menu' ) );

		expect( screen.getByText( 'Edit' ) ).toBeVisible();
		expect( screen.getByText( 'Delete' ) ).toBeVisible();
	} );

	test( 'shows a surviving annual plan with its annual price and only Delete', async () => {
		const user = userEvent.setup();
		renderProductsList( [ annualTier ] );
		const plan = within( screen.getByText( 'Annual Tier' ).closest( '.card' ) );

		expect( plan.getByText( '$30.00/year' ) ).toBeVisible();
		await user.click( plan.getByTitle( 'Toggle menu' ) );

		expect( screen.queryByText( 'Edit' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Delete' ) ).toBeVisible();
	} );

	test( 'shows a read-only surviving annual plan without write actions', () => {
		renderProductsList( [ { ...annualTier, is_read_only: true } ] );
		const plan = within( screen.getByText( 'Annual Tier' ).closest( '.card' ) );

		expect( plan.getByText( 'Read-only' ) ).toBeVisible();
		expect( plan.queryByTitle( 'Toggle menu' ) ).not.toBeInTheDocument();
	} );

	test.each( [ tierWithoutDescription, annualTier ] )(
		'keeps the rejected $title visible after a partially successful paired deletion',
		async ( failedProduct ) => {
			const user = userEvent.setup();
			wpcom.req.post.mockImplementation( ( { path } ) =>
				Promise.resolve(
					path.endsWith( `/${ failedProduct.ID }` ) ? { error: 'Plan is read-only' } : {}
				)
			);
			renderProductsList( [ tierWithoutDescription, annualTier ] );
			const plan = within( screen.getByText( 'Basic Tier' ).closest( '.card' ) );

			await user.click( plan.getByTitle( 'Toggle menu' ) );
			await user.click( screen.getByText( 'Delete' ) );
			await user.click( screen.getByRole( 'button', { name: 'Delete', exact: true } ) );

			await waitFor( () => expect( wpcom.req.post ).toHaveBeenCalledTimes( 2 ) );
			expect( await screen.findByText( failedProduct.title ) ).toBeVisible();
			const deletedProduct =
				failedProduct.ID === annualTier.ID ? tierWithoutDescription : annualTier;
			expect( screen.queryByText( deletedProduct.title ) ).not.toBeInTheDocument();
		}
	);

	test.each( [
		[ true, false ],
		[ false, true ],
	] )(
		'disables direct delete confirmation with monthly=%s and annual=%s read-only',
		( monthlyReadOnly, annualReadOnly ) => {
			renderWithProvider(
				<RecurringPaymentsPlanDeleteModal
					product={ { ...tierWithoutDescription, is_read_only: monthlyReadOnly } }
					annualProduct={ { ...annualTier, is_read_only: annualReadOnly } }
					closeDialog={ jest.fn() }
				/>,
				{ initialState, reducers: { ui: uiReducer, memberships: membershipsReducer } }
			);

			expect( screen.getByRole( 'button', { name: 'Delete', exact: true } ) ).toBeDisabled();
			expect( wpcom.req.post ).not.toHaveBeenCalled();
		}
	);

	test( 'keeps a stale plan visible when the backend rejects deletion', async () => {
		const user = userEvent.setup();
		wpcom.req.post.mockResolvedValue( { error: 'Plan is read-only' } );
		renderProductsList( [ donationPlan ] );

		await user.click( screen.getByTitle( 'Toggle menu' ) );
		await user.click( screen.getByText( 'Delete' ) );
		await user.click( screen.getByRole( 'button', { name: 'Delete', exact: true } ) );

		expect( await screen.findByText( 'One-time Donation' ) ).toBeVisible();
		expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
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

	// Without it, checkout drops the user on the generic thank-you page instead of
	// the payment plans they were trying to add.
	test( 'sends the user back to the payments page after upgrading', () => {
		window.history.pushState( {}, '', '/earn/payments/example.wordpress.com' );
		renderWithProvider( <ProductsList />, {
			initialState: {
				sites: {
					items: { 1: { ID: 1, URL: 'https://example.wordpress.com' } },
					// A loaded feature list without any of the Stripe-backed features is
					// what puts the site behind the upsell.
					features: { 1: { data: { active: [ 'wordads' ] } } },
				},
				ui: { selectedSiteId: 1 },
				memberships: { productList: { items: {} }, settings: {} },
				siteSettings: { items: {}, requesting: { 1: true }, saveRequests: {} },
			},
			reducers: {
				ui: uiReducer,
				memberships: membershipsReducer,
				siteSettings: siteSettingsReducer,
			},
		} );

		const url = new URL(
			screen.getByRole( 'link', { name: 'Upgrade' } ).getAttribute( 'href' ),
			window.location.origin
		);
		expect( url.pathname ).toBe( '/plans/example.wordpress.com' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( '/earn/payments/example.wordpress.com' );
	} );
} );
