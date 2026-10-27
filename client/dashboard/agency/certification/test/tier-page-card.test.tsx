/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import CertificationTierPageCard from '../tier-page-card';
import type { AgencyApwdDiscountCode } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 1, approval_status: 'approved', tier: { id: 'agency-partner' } } ] );
}

function mockDiscountCode( coupon: Partial< AgencyApwdDiscountCode > | null ) {
	return nock( API ).get( '/wpcom/v2/agency/1/apwd-discount-code' ).reply( 200, coupon );
}

describe( '<CertificationTierPageCard>', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'shows the agency’s code and discount from HubSpot', async () => {
		mockAgency();
		mockDiscountCode( { code: 'HUBSPOT-CODE-123', discount_percent: '30' } );
		render( <CertificationTierPageCard /> );

		await waitFor( () =>
			expect( screen.getByRole( 'textbox', { name: 'Your agency’s discount code' } ) ).toHaveValue(
				'HUBSPOT-CODE-123'
			)
		);
		expect( screen.getByText( '30% off the exam fee' ) ).toBeVisible();
	} );

	test( 'stays hidden when the agency has no active coupon', async () => {
		mockAgency();
		const scope = mockDiscountCode( null );
		render( <CertificationTierPageCard /> );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect(
			screen.queryByRole( 'heading', { name: 'Your developer certification discount' } )
		).not.toBeInTheDocument();
	} );
} );
