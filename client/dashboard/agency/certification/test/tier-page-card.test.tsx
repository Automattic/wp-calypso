/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
	// Serialized by hand because nock's body type has no null, which the endpoint returns.
	return nock( API )
		.get( '/wpcom/v2/agency/1/apwd-discount-code' )
		.reply( 200, JSON.stringify( coupon ), { 'Content-Type': 'application/json' } );
}

describe( '<CertificationTierPageCard>', () => {
	const originalClipboard = window.navigator.clipboard;

	beforeEach( () => {
		Object.defineProperty( window.navigator, 'clipboard', {
			value: { writeText: jest.fn().mockResolvedValue( undefined ) },
			configurable: true,
		} );
	} );

	afterEach( () => {
		nock.cleanAll();
		Object.defineProperty( window.navigator, 'clipboard', {
			value: originalClipboard,
			configurable: true,
		} );
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

	test( 'previews the share message, then copies it', async () => {
		const writeText = jest.fn().mockResolvedValue( undefined );
		Object.defineProperty( window.navigator, 'clipboard', {
			value: { writeText },
			configurable: true,
		} );
		mockAgency();
		mockDiscountCode( { code: 'HUBSPOT-CODE-123', discount_percent: '30' } );
		render( <CertificationTierPageCard /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Share with your team' } ) );
		const message = screen.getByRole( 'textbox', { name: 'Message' } ) as HTMLTextAreaElement;
		expect( message.value ).toContain( 'We get 30% off the Advanced Professional WordPress' );
		expect( message.value ).toContain( 'Discount code: HUBSPOT-CODE-123' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Copy message' } ) );
		expect( writeText ).toHaveBeenCalledWith( message.value );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
	} );

	test( 'records a view, code copies and exam clicks', async () => {
		const recordTracksEvent = jest.fn();
		mockAgency();
		mockDiscountCode( { code: 'HUBSPOT-CODE-123', discount_percent: '30' } );
		render( <CertificationTierPageCard recordTracksEvent={ recordTracksEvent } /> );

		await userEvent.click(
			await screen.findByRole( 'button', { name: 'Copy Your agency’s discount code' } )
		);
		await userEvent.click( screen.getByRole( 'link', { name: /Sign up for the exam/ } ) );

		const source = { source: 'agency_tier' };
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_certification_view', source );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_certification_code_copy',
			source
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_certification_exam_click',
			source
		);
	} );

	test( 'stays hidden, and records no view, when the agency has no active coupon', async () => {
		const recordTracksEvent = jest.fn();
		mockAgency();
		const scope = mockDiscountCode( null );
		render( <CertificationTierPageCard recordTracksEvent={ recordTracksEvent } /> );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect(
			screen.queryByRole( 'heading', { name: 'Your developer certification discount' } )
		).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
