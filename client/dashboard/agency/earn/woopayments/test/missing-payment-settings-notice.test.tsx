/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import MissingPaymentSettingsNotice from '../missing-payment-settings-notice';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;
const NOTICE_TITLE = 'Add your payout information to get paid.';

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
}

function mockTipalti( isPayable: boolean ) {
	return nock( API )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/tipalti` )
		.query( true )
		.reply( 200, { Status: 'Active', IsPayable: isPayable, PayableReason: [] } );
}

describe( 'MissingPaymentSettingsNotice', () => {
	test( 'shows the notice when the agency has sites but is not payable', async () => {
		mockAgency();
		mockTipalti( false );

		render( <MissingPaymentSettingsNotice hasSites /> );

		expect( await screen.findByText( NOTICE_TITLE ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Add payout information now' } ) ).toHaveAttribute(
			'href',
			'/woopayments/payment-settings'
		);
	} );

	test( 'renders nothing when the agency is payable', async () => {
		mockAgency();
		const scope = mockTipalti( true );

		render( <MissingPaymentSettingsNotice hasSites /> );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'does not fetch Tipalti or render when the agency has no sites', async () => {
		mockAgency();
		const scope = mockTipalti( false );

		render( <MissingPaymentSettingsNotice hasSites={ false } /> );

		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
		// The Tipalti query is gated on has-sites, so no request should be made.
		expect( scope.isDone() ).toBe( false );
	} );
} );
