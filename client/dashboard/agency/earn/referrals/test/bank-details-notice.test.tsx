/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import BankDetailsNotice from '../bank-details-notice';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;
const NOTICE_TEXT = /Thanks for entering your bank and tax information/;

function mockPayee( { isPayable = true }: { isPayable?: boolean } = {} ) {
	nock( BASE )
		.persist()
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/tipalti` )
		.query( true )
		.reply( 200, { Status: 'Active', IsPayable: isPayable } );
}

function mockPreferences( seen: boolean ) {
	nock( BASE )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: seen ? { 'a4a-referrals-bank-details-success-notice-seen': true } : {},
		} );
}

describe( '<BankDetailsNotice>', () => {
	afterEach( () => nock.cleanAll() );

	test( 'confirms the details once and records that it was shown', async () => {
		mockPayee();
		mockPreferences( false );
		const scope = nock( BASE )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				expect( body.calypso_preferences ).toEqual(
					expect.objectContaining( { 'a4a-referrals-bank-details-success-notice-seen': true } )
				);
				return true;
			} )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );

		render( <BankDetailsNotice agencyId={ AGENCY_ID } /> );

		expect( await screen.findByText( NOTICE_TEXT ) ).toBeVisible();
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'stays hidden once it has been seen', async () => {
		mockPayee();
		mockPreferences( true );

		render( <BankDetailsNotice agencyId={ AGENCY_ID } /> );

		await waitFor( () => expect( screen.queryByText( NOTICE_TEXT ) ).not.toBeInTheDocument() );
	} );

	test( 'stays hidden while the account is not payable', async () => {
		mockPayee( { isPayable: false } );
		mockPreferences( false );

		render( <BankDetailsNotice agencyId={ AGENCY_ID } /> );

		await waitFor( () => expect( screen.queryByText( NOTICE_TEXT ) ).not.toBeInTheDocument() );
	} );

	test( 'can be dismissed', async () => {
		mockPayee();
		mockPreferences( false );
		nock( BASE )
			.persist()
			.post( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );

		render( <BankDetailsNotice agencyId={ AGENCY_ID } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Dismiss' } ) );

		await waitFor( () => expect( screen.queryByText( NOTICE_TEXT ) ).not.toBeInTheDocument() );
	} );
} );
