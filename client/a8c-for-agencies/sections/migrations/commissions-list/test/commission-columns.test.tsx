/**
 * @jest-environment jsdom
 *
 * Run: yarn test-client client/a8c-for-agencies/sections/migrations/commissions-list/test/commission-columns.test.tsx
 */

import { render, screen } from '@testing-library/react';
import { ReviewStatusColumn } from '../commission-columns';

describe( 'ReviewStatusColumn', () => {
	it( 'renders nothing when the review status is empty', () => {
		const { container } = render( <ReviewStatusColumn reviewStatus="" /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'shows a "Pending" badge for pending migrations', () => {
		render( <ReviewStatusColumn reviewStatus="pending" /> );
		expect( screen.getByText( 'Pending' ) ).toBeVisible();
	} );

	it( 'shows an "Ineligible" badge for rejected migrations', () => {
		render( <ReviewStatusColumn reviewStatus="rejected" /> );
		expect( screen.getByText( 'Ineligible' ) ).toBeVisible();
	} );

	it( 'shows an "Ineligible" badge for ineligible migrations', () => {
		render( <ReviewStatusColumn reviewStatus="ineligible" /> );
		expect( screen.getByText( 'Ineligible' ) ).toBeVisible();
	} );
} );
