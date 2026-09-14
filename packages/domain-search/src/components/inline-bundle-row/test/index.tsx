/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineBundleRow } from '..';
import { buildCart } from '../../../test-helpers/factories/cart';
import { TestDomainSearch } from '../../../test-helpers/renderer';
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
	sld: 'flowers',
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

const bundleWithRoles = buildSuggestion( [
	buildDomain( { domain: 'flowers.com', cost: '$22.00', role: 'primary' } ),
	buildDomain( { domain: 'flowers.net', cost: '$18.00', role: 'companion' } ),
	buildDomain( { domain: 'flowers.org', cost: '$20.00', role: 'companion' } ),
] );

const renderRow = (
	props: Partial< React.ComponentProps< typeof InlineBundleRow > > = {},
	cartOverrides = {}
) =>
	render(
		<TestDomainSearch cart={ buildCart( cartOverrides ) }>
			<InlineBundleRow bundle={ bundleWithRoles } isLoading={ false } { ...props } />
		</TestDomainSearch>
	);

describe( 'InlineBundleRow', () => {
	it( 'renders a loading state while the bundle is being fetched', () => {
		renderRow( { bundle: undefined, isLoading: true } );

		expect( screen.getByText( 'Finding a bundle for your domain…' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when there is no bundle and it is not loading', () => {
		const { container } = renderRow( { bundle: null } );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'leads with the primary domain, then the companion TLDs', () => {
		renderRow();

		// The line reads `flowers.com + .net + .org`: the primary in full, then
		// the companion extensions the bundle adds.
		expect( screen.getByText( 'flowers.com' ) ).toBeInTheDocument();
		expect( screen.getByText( '.net' ) ).toBeInTheDocument();
		expect( screen.getByText( '.org' ) ).toBeInTheDocument();
	} );

	it( 'prices the full bundle', () => {
		renderRow();

		expect( screen.getByText( '60' ) ).toBeInTheDocument();

		const original = screen.getByText( '75' );
		expect( original.closest( 's' ) ).not.toBeNull();
	} );

	it( 'renders the bundle-and-save badge and the protect-your-brand subline', () => {
		renderRow();

		expect( screen.getByText( 'Bundle and save 20%' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Secure popular domain extensions and protect your brand' )
		).toBeInTheDocument();
	} );

	it( 'adds every bundle member via cart.onAddBundle when "Get bundle" is clicked', async () => {
		const user = userEvent.setup();
		const onAddBundle = jest.fn().mockResolvedValue( undefined );

		renderRow( {}, { onAddBundle } );

		await user.click( screen.getByRole( 'button', { name: 'Get bundle' } ) );

		expect( onAddBundle ).toHaveBeenCalledTimes( 1 );
		expect( onAddBundle ).toHaveBeenCalledWith(
			expect.objectContaining( { bundle_group_id: 'group-1' } )
		);
	} );

	it( 'swaps "Get bundle" for a "Continue" CTA when every bundle member is already in the cart', async () => {
		const user = userEvent.setup();
		const onContinue = jest.fn();

		render(
			<TestDomainSearch cart={ buildCart( { hasItem: () => true } ) } events={ { onContinue } }>
				<InlineBundleRow bundle={ bundleWithRoles } isLoading={ false } />
			</TestDomainSearch>
		);

		expect( screen.queryByRole( 'button', { name: 'Get bundle' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );
} );
