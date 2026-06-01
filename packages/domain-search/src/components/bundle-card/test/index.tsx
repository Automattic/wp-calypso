/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
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
	it( 'renders the SLD as a heading', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		expect( screen.getByRole( 'heading', { name: 'example' } ) ).toBeInTheDocument();
	} );

	it( 'renders exactly 2 companion rows for a 2-domain bundle', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 2 );
	} );

	it( 'renders exactly 3 companion rows for a 3-domain bundle', () => {
		render( <BundleCard suggestion={ buildSuggestion( threeDomains ) } /> );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 3 );
	} );

	it( 'renders exactly 4 companion rows for a 4-domain bundle', () => {
		render( <BundleCard suggestion={ buildSuggestion( fourDomains ) } /> );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 4 );
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

	it( 'renders the discount percent text', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains, { discount_percent: 20 } ) } /> );

		expect( screen.getByText( 'Save 20%' ) ).toBeInTheDocument();
	} );

	it( 'renders the premium badge and legal notice when a domain is premium', () => {
		render(
			<BundleCard
				suggestion={ buildSuggestion( [
					buildDomain( { domain: 'example.com', cost: '$3,500.00', is_premium: true } ),
					buildDomain( { domain: 'example.net', cost: '$18.00' } ),
				] ) }
			/>
		);

		expect( screen.getByText( 'Premium' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /Premium domains are subject to different pricing/ )
		).toBeInTheDocument();
	} );

	it( 'does not render the premium badge or notice for a non-premium bundle', () => {
		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		expect( screen.queryByText( 'Premium' ) ).not.toBeInTheDocument();
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

	it( 'does not throw when the CTA is clicked without an onAddToCart callback', async () => {
		const user = userEvent.setup();

		render( <BundleCard suggestion={ buildSuggestion( twoDomains ) } /> );

		await expect(
			user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) )
		).resolves.not.toThrow();
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
