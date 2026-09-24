/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import EarnReferrals from '../index';
import type { ReferralApiResponse } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

const referral: ReferralApiResponse = {
	id: 1,
	client: { id: 7, email: 'client@example.com' },
	products: [],
	status: 'active',
	checkout_url: '',
};

function mockEndpoints( {
	approvalStatus = 'approved',
	referrals = [ referral ],
	isPayable = true,
}: {
	approvalStatus?: string;
	referrals?: ReferralApiResponse[];
	isPayable?: boolean;
} = {} ) {
	nock( BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );

	nock( BASE )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID, approval_status: approvalStatus } ] );

	nock( BASE )
		.persist()
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/referrals` )
		.query( true )
		.reply( 200, referrals );

	nock( BASE )
		.persist()
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/referrals/commission-payout` )
		.query( true )
		.reply( 200, { client_data: [] } );

	nock( BASE )
		.persist()
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/tipalti` )
		.query( true )
		.reply( 200, { Status: 'Active', IsPayable: isPayable } );

	nock( BASE ).persist().get( '/wpcom/v2/agency/products' ).query( true ).reply( 200, [] );
}

const newReferralButton = () => screen.queryByRole( 'link', { name: 'New referral' } );

describe( '<EarnReferrals>', () => {
	afterEach( () => nock.cleanAll() );

	test( 'offers a new referral to an approved agency', async () => {
		mockEndpoints();
		const { recordTracksEvent } = render( <EarnReferrals /> );

		const button = await screen.findByRole( 'link', { name: 'New referral' } );
		await userEvent.click( button );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_referrals_make_a_referral_button_click'
		);
	} );

	test( 'hides the new referral button until the agency is approved', async () => {
		mockEndpoints( { approvalStatus: 'pending' } );
		render( <EarnReferrals /> );

		expect( await screen.findByText( 'Referrals' ) ).toBeVisible();
		await waitFor( () => expect( newReferralButton() ).not.toBeInTheDocument() );
	} );

	test( 'records opening a referral from the list', async () => {
		mockEndpoints();
		const { recordTracksEvent } = render( <EarnReferrals /> );

		await userEvent.click( await screen.findByRole( 'link', { name: 'client@example.com' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_referrals_list_view_details_click'
		);
	} );

	test( 'asks for payout details with referral-specific copy, and lets it be dismissed', async () => {
		mockEndpoints( { isPayable: false } );
		render( <EarnReferrals /> );

		expect( await screen.findByText( /You’ve successfully made a client referral/ ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		await waitFor( () =>
			expect(
				screen.queryByText( /You’ve successfully made a client referral/ )
			).not.toBeInTheDocument()
		);
	} );
} );
