/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { PLAN_100_YEARS } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import React from 'react';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import EmptyDomainsListCard from '../empty-domains-list-card';

const freeSite = {
	ID: 1,
	plan: { product_slug: 'free_plan' },
	slug: 'example.com',
};

const paidSite = {
	ID: 1,
	plan: { product_slug: 'value_bundle' },
	slug: 'example.com',
};

const hundredYearSite = {
	plan: { product_slug: PLAN_100_YEARS },
	slug: 'example.com',
};

jest.mock( 'calypso/state/purchases/selectors/fetching', () => ( {
	isFetchingUserPurchases: jest.fn().mockReturnValue( false ),
} ) );

jest.mock( 'calypso/components/data/query-products-list', () => {
	return function MockQueryProductsList() {
		return null;
	};
} );

jest.mock(
	'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable',
	() => ( {
		useDomainToPlanCreditsApplicable: jest.fn().mockReturnValue( null ),
	} )
);

describe( 'EmptyDomainsListCard', () => {
	describe( 'Free plan scenarios', () => {
		it( "displays 'upgrade to a plan' message when site has no domain credit", () => {
			renderWithProvider( <EmptyDomainsListCard selectedSite={ freeSite } /> );

			expect( screen.getByText( 'Get your free domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Upgrade to a plan' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Just search for a domain' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'Get a free one-year domain registration or transfer with any annual paid plan.'
				)
			).toBeInTheDocument();
		} );

		it( 'displays empty if site has domain-to-plan credit', () => {
			useDomainToPlanCreditsApplicable.mockImplementationOnce( () => 1 );

			const { container } = renderWithProvider(
				<EmptyDomainsListCard selectedSite={ freeSite } />
			);

			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'Paid plan scenarios', () => {
		it( "displays 'claim free domain' and 'free registration or transfer' message when site has domain credit", () => {
			renderWithProvider( <EmptyDomainsListCard selectedSite={ paidSite } hasDomainCredit /> );

			expect( screen.getByText( 'Claim your free domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Search for a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Use a domain I own' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'You have a free one-year domain registration or transfer included with your plan.'
				)
			).toBeInTheDocument();
		} );

		it( "displays 'claim free domain' message when site has domain credit and non-wpcom domains", () => {
			renderWithProvider(
				<EmptyDomainsListCard selectedSite={ paidSite } hasDomainCredit hasNonWpcomDomains />
			);

			expect( screen.getByText( 'Claim your free domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Search for a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Use a domain I own' ) ).toBeInTheDocument();
		} );

		it( "displays 'add your domain' and 'you have no domains' message when site has no domain credit", () => {
			renderWithProvider( <EmptyDomainsListCard selectedSite={ paidSite } /> );

			expect( screen.getByText( 'Add your domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'You have no domains added to this site.' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Search for a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Use a domain I own' ) ).toBeInTheDocument();
		} );

		it( 'displays empty when site has no domain credit and non-wpcom domains', () => {
			const { container } = renderWithProvider(
				<EmptyDomainsListCard selectedSite={ paidSite } hasNonWpcomDomains />
			);

			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( '100 Year Plan scenarios', () => {
		it( "displays 'claim free domain' and 'free registration or transfer' message when site has domain credit", () => {
			renderWithProvider(
				<EmptyDomainsListCard selectedSite={ hundredYearSite } hasDomainCredit />
			);

			expect( screen.getByText( 'Claim your free domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Search for a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Use a domain I own' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'You have a free domain registration or transfer included with your plan.'
				)
			).toBeInTheDocument();
		} );
	} );
} );
