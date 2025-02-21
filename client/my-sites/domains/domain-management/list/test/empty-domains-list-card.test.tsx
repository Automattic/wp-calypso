/**
 * @jest-environment jsdom
 */

import { PLAN_100_YEARS } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import EmptyDomainsListCard from '../empty-domains-list-card';

const mockProduct = {
	combined_cost_display: '$12/year',
};

// Mock the required selectors
jest.mock( 'calypso/state/products-list/selectors', () => ( {
	getProductBySlug: () => mockProduct,
} ) );

jest.mock( 'calypso/state/purchases/selectors', () => ( {
	hasPurchasedDomain: () => false,
} ) );

// Mock QueryProductsList component to prevent actual API calls
jest.mock( 'calypso/components/data/query-products-list', () => {
	return function MockQueryProductsList() {
		return null;
	};
} );

describe( 'EmptyDomainsListCard', () => {
	describe( 'Free plan scenarios', () => {
		it( 'renders upgrade message for free plan sites', () => {
			const selectedSite = {
				plan: {
					product_slug: 'free_plan',
				},
				slug: 'example.com',
			};

			renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit={ false }
					isCompact={ false }
					hasNonWpcomDomains={ false }
				/>
			);

			expect( screen.getByText( 'Get your free domain' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'Get a free one-year domain registration or transfer with any annual paid plan.'
				)
			).toBeInTheDocument();
			expect( screen.getByText( 'Upgrade to a plan' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Just search for a domain' ) ).toBeInTheDocument();
		} );

		it( 'returns null if site has no paid plan but has purchased domain', () => {
			jest
				.spyOn( require( 'calypso/state/purchases/selectors' ), 'hasPurchasedDomain' )
				.mockReturnValue( true );

			const selectedSite = {
				plan: {
					product_slug: 'free_plan',
				},
				slug: 'example.com',
				ID: 1,
			};

			const { container } = renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit={ false }
					isCompact={ false }
					hasNonWpcomDomains={ false }
				/>
			);

			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'Paid plan scenarios', () => {
		it( 'renders add domain message for paid plan without domain credit', () => {
			const selectedSite = {
				plan: {
					product_slug: 'value_bundle',
				},
				slug: 'example.com',
			};

			renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit={ false }
					isCompact={ false }
					hasNonWpcomDomains={ false }
				/>
			);

			expect( screen.getByText( 'Add your domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'You have no domains added to this site.' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Search for a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Use a domain I own' ) ).toBeInTheDocument();
		} );

		it( 'returns null for paid plan without domain credit but with non-wpcom domains', () => {
			const selectedSite = {
				plan: {
					product_slug: 'value_bundle',
				},
				slug: 'example.com',
			};

			const { container } = renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit={ false }
					isCompact={ false }
					hasNonWpcomDomains
				/>
			);

			expect( container ).toBeEmptyDOMElement();
		} );

		it( 'renders claim domain message for paid plan with domain credit', () => {
			const selectedSite = {
				plan: {
					product_slug: 'value_bundle',
				},
				slug: 'example.com',
			};

			renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit
					isCompact={ false }
					hasNonWpcomDomains={ false }
				/>
			);

			expect( screen.getByText( 'Claim your free domain' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'You have a free one-year domain registration or transfer included with your plan.'
				)
			).toBeInTheDocument();
			expect( screen.getByText( 'Search for a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Use a domain I own' ) ).toBeInTheDocument();
		} );
	} );

	describe( '100 Year Plan scenarios', () => {
		it( 'renders special message for 100 year plan with domain credit', () => {
			const selectedSite = {
				plan: {
					product_slug: PLAN_100_YEARS,
				},
				slug: 'example.com',
			};

			renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit
					isCompact={ false }
					hasNonWpcomDomains={ false }
				/>
			);

			expect( screen.getByText( 'Claim your free domain' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'You have a free domain registration or transfer included with your plan.'
				)
			).toBeInTheDocument();
			expect( screen.getByText( 'Search for a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Use a domain I own' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Styling', () => {
		it( 'applies correct class when hasNonWpcomDomains is true', () => {
			const selectedSite = {
				plan: {
					product_slug: 'value_bundle',
				},
				slug: 'example.com',
			};

			const { container } = renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit
					isCompact={ false }
					hasNonWpcomDomains
				/>
			);

			const element = container.querySelector( '.has-non-wpcom-domains' );
			expect( element ).toBeInTheDocument();
		} );

		it( 'handles compact mode correctly', () => {
			const selectedSite = {
				plan: {
					product_slug: 'value_bundle',
				},
				slug: 'example.com',
			};

			const { container } = renderWithProvider(
				<EmptyDomainsListCard
					selectedSite={ selectedSite }
					hasDomainCredit
					isCompact
					hasNonWpcomDomains={ false }
				/>
			);

			const element = container.querySelector( '.is-compact' );
			expect( element ).toBeInTheDocument();
		} );
	} );
} );
