/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React from 'react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider as renderWithProviderHelper } from 'calypso/test-helpers/testing-library';
import { DomainProductPrice } from '../index';

const translate = ( str: string ) => {
	return str;
};
const renderWithProvider = ( el: React.ReactNode ) => {
	return renderWithProviderHelper( el, {
		reducers: { ui },
	} );
};

describe( 'DomainProductPrice', () => {
	const defaultProps = {
		domainsWithPlansOnly: true,
		translate,
		price: '$12',
	};

	describe( 'free with plan scenarios', () => {
		test( 'shows correct label for mapping product with FREE_WITH_PLAN', () => {
			renderWithProvider(
				<DomainProductPrice { ...defaultProps } isMappingProduct rule="FREE_WITH_PLAN" />
			);
			expect( screen.getByText( 'Free with your plan' ) ).toBeInTheDocument();
		} );

		test( 'shows correct label for 100 year plan', () => {
			renderWithProvider(
				<DomainProductPrice { ...defaultProps } isCurrentPlan100YearPlan rule="FREE_WITH_PLAN" />
			);
			expect( screen.getByText( 'Free with your plan' ) ).toBeInTheDocument();
		} );

		test( 'shows correct label for mapping with higher plan', () => {
			renderWithProvider(
				<DomainProductPrice { ...defaultProps } isMappingProduct rule="INCLUDED_IN_HIGHER_PLAN" />
			);
			expect( screen.getByText( 'Included in paid plans' ) ).toBeInTheDocument();
		} );

		test( 'shows correct label for monthly business plans', () => {
			renderWithProvider(
				<DomainProductPrice
					{ ...defaultProps }
					isBusinessOrEcommerceMonthlyPlan
					rule="FREE_WITH_PLAN"
				/>
			);
			expect( screen.getByText( 'Free domain for one year' ) ).toBeInTheDocument();
		} );

		test( 'shows correct label for plan upgrade requirement', () => {
			renderWithProvider(
				<DomainProductPrice { ...defaultProps } rule="UPGRADE_TO_HIGHER_PLAN_TO_BUY" />
			);
			expect( screen.getByText( /plan required/ ) ).toBeInTheDocument();
		} );

		test( 'shows default label for FREE_WITH_PLAN', () => {
			renderWithProvider( <DomainProductPrice { ...defaultProps } rule="FREE_WITH_PLAN" /> );
			expect(
				screen.getByText( /Free for the first year with annual paid plans/ )
			).toBeInTheDocument();
		} );
	} );
} );
