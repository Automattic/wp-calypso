/**
 * @jest-environment jsdom
 *
 * Run: yarn test-client client/a8c-for-agencies/sections/migrations/commissions-list/test/commission-columns.test.tsx
 */

import { render, screen } from '@testing-library/react';
import { ReviewStatusColumn } from '../commission-columns';

describe( 'ReviewStatusColumn', () => {
	it( 'renders nothing when the review status is empty', () => {
		const { container } = render( <ReviewStatusColumn reviewStatus="" canTagSitesForCommission /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'shows a "Pending" badge for pending migrations while the agency is still eligible for the incentive', () => {
		render( <ReviewStatusColumn reviewStatus="pending" canTagSitesForCommission /> );
		expect( screen.getByText( 'Pending' ) ).toBeVisible();
	} );

	it( 'shows an "Ineligible" badge for pending migrations once the agency is no longer eligible for the incentive', () => {
		render( <ReviewStatusColumn reviewStatus="pending" canTagSitesForCommission={ false } /> );
		expect( screen.getByText( 'Ineligible' ) ).toBeVisible();
	} );

	it( 'shows an "Ineligible" badge for rejected migrations regardless of incentive eligibility', () => {
		render( <ReviewStatusColumn reviewStatus="rejected" canTagSitesForCommission /> );
		expect( screen.getByText( 'Ineligible' ) ).toBeVisible();
	} );
} );
