/**
 * @jest-environment jsdom
 */
import { getByText, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BundleCard } from '..';
import type { BundleSuggestion, BundleSuggestionDomain } from '@automattic/api-core';

const buildDomain = (
	overrides: Partial< BundleSuggestionDomain > & Pick< BundleSuggestionDomain, 'domain' | 'cost' >
): BundleSuggestionDomain => ( {
	raw_price: 22,
	product_slug: 'domain_reg',
	...overrides,
} );

const buildSuggestion = (
	domains: BundleSuggestionDomain[],
	overrides: Partial< BundleSuggestion > = {}
): BundleSuggestion => ( {
	sld: 'example',
	domains,
	bundle_price: 60,
	original_price: 75,
	discount_percent: 20,
	category: 'business',
	bundle_id: 'bundle-1',
	bundle_group_id: 'group-1',
	catalogue_version: '2024-01-01',
	...overrides,
} );

const twoDomains = [
	buildDomain( { domain: 'example.com', cost: '$22.00' } ),
	buildDomain( { domain: 'example.net', cost: '$18.00' } ),
];

const threeDomains = [ ...twoDomains, buildDomain( { domain: 'example.org', cost: '$20.00' } ) ];

const fourDomains = [ ...threeDomains, buildDomain( { domain: 'example.io', cost: '$30.00' } ) ];

describe( 'BundleCard', () => {
	it( 'renders the protect-your-brand header', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		expect( screen.getByText( 'Protect your brand' ) ).toBeInTheDocument();
	} );

	it( 'renders a TLD chip for each member domain', () => {
		// Scoped to the chips row: the member line below also renders ".com" etc.
		const { container } = render( <BundleCard suggestion={ buildSuggestion( fourDomains ) } /> );
		const chips = container.querySelector( '.bundle-card__tlds' ) as HTMLElement;

		expect( getByText( chips, '.com' ) ).toBeInTheDocument();
		expect( getByText( chips, '.net' ) ).toBeInTheDocument();
		expect( getByText( chips, '.org' ) ).toBeInTheDocument();
		expect( getByText( chips, '.io' ) ).toBeInTheDocument();
	} );

	it( 'renders the member domains as a comma-joined line', () => {
		// The TLD of each member is wrapped in its own span for emphasis, so assert
		// on the line's combined text rather than a single text node.
		const { container } = render( <BundleCard suggestion={ buildSuggestion( threeDomains ) } /> );
		const members = container.querySelector( '.bundle-card__members' ) as HTMLElement;

		expect( members.textContent ).toBe( 'example.com, example.net, example.org' );
	} );

	it( 'renders the bundle price and the struck-through original price', () => {
		render(
			<BundleCard
				suggestion={ buildSuggestion( twoDomains, {
					bundle_price: 60,
					original_price: 75,
				} ) }
			/>
		);

		expect( screen.getByText( '60' ) ).toBeInTheDocument();

		const original = screen.getByText( '75' );
		expect( original.closest( 's' ) ).not.toBeNull();
	} );

	it( 'renders formatted bundle totals when provided', () => {
		render(
			<BundleCard
				suggestion={ buildSuggestion( twoDomains, {
					bundle_price: 29.9,
					bundle_cost: '$29.90',
					original_price: 39,
					original_cost: '$39',
				} ) }
			/>
		);

		expect( screen.getByText( '$29.90' ) ).toBeInTheDocument();

		const original = screen.getByText( '$39' );
		expect( original.closest( 's' ) ).not.toBeNull();

		expect( screen.queryByText( '29.9' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the discount percent text', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains, { discount_percent: 20 } ) } /> );

		expect( screen.getByText( 'Bundle and save 20%' ) ).toBeInTheDocument();
	} );

	it( 'renders the premium legal notice when a domain is premium', () => {
		render(
			<BundleCard
				suggestion={ buildSuggestion( [
					buildDomain( { domain: 'example.com', cost: '$3,500.00', is_premium: true } ),
					buildDomain( { domain: 'example.net', cost: '$18.00' } ),
				] ) }
			/>
		);

		expect(
			screen.getByText( /Premium domains are subject to different pricing/ )
		).toBeInTheDocument();
	} );

	it( 'does not render the premium notice for a non-premium bundle', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		expect(
			screen.queryByText( /Premium domains are subject to different pricing/ )
		).not.toBeInTheDocument();
	} );

	it( 'invokes onAddToCart once with the suggestion when the CTA is clicked', async () => {
		const user = userEvent.setup();
		const onAddToCart = jest.fn();
		const suggestion = buildSuggestion( twoDomains );

		render( <BundleCard suggestion={ suggestion } onAddToCart={ onAddToCart } /> );

		await user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) );

		expect( onAddToCart ).toHaveBeenCalledTimes( 1 );
		expect( onAddToCart ).toHaveBeenCalledWith( suggestion );
	} );

	it( 'renders a Continue CTA instead of Get bundle when the bundle is already in the cart', async () => {
		const user = userEvent.setup();
		const onContinue = jest.fn();
		const onAddToCart = jest.fn();

		render(
			<BundleCard
				suggestion={ buildSuggestion( twoDomains ) }
				onAddToCart={ onAddToCart }
				isAddedToCart
				onContinue={ onContinue }
			/>
		);

		expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalledTimes( 1 );
		expect( onAddToCart ).not.toHaveBeenCalled();
	} );

	it( 'does not throw when Continue is clicked without an onContinue callback', async () => {
		const user = userEvent.setup();

		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } isAddedToCart /> );

		await expect(
			user.click( screen.getByRole( 'button', { name: 'Continue' } ) )
		).resolves.not.toThrow();
	} );

	it( 'does not throw when the CTA is clicked without an onAddToCart callback', async () => {
		const user = userEvent.setup();

		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		await expect(
			user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) )
		).resolves.not.toThrow();
	} );

	it( 'renders the error message when errorMessage is provided', () => {
		// Scoped to the render container because the Notice also announces the
		// message through the a11y-speak live region appended to document.body.
		const { container } = render(
			<BundleCard
				suggestion={ buildSuggestion( twoDomains ) }
				errorMessage="Something went wrong."
			/>
		);

		expect( getByText( container, 'Something went wrong.' ) ).toBeInTheDocument();
		// The CTA stays available so the user can retry.
		expect( screen.getByRole( 'button', { name: 'Get bundle' } ) ).toBeEnabled();
	} );

	it( 'does not render an error notice when errorMessage is not provided', () => {
		const { container } = render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		expect( container.querySelector( '.domain-search-notice' ) ).not.toBeInTheDocument();
	} );

	it( 'marks the CTA busy and disabled while an add-to-cart is in flight', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } isBusy disabled /> );

		expect( screen.getByRole( 'button', { name: 'Get bundle' } ) ).toBeDisabled();
	} );

	it( 'renders a placeholder with no CTA or domain rows for a null suggestion', () => {
		render( <BundleCard suggestion={ null } /> );

		expect( screen.getByText( 'No bundle available.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'listitem' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders a placeholder when the bundle has no domains', () => {
		render( <BundleCard suggestion={ buildSuggestion( [] ) } /> );

		expect( screen.getByText( 'No bundle available.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'listitem' ) ).not.toBeInTheDocument();
	} );
} );
