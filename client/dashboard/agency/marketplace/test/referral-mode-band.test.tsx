/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { queryClient } from '@automattic/api-queries';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ReferralModeBand from '../referral-mode-band';

const API = 'https://public-api.wordpress.com';

function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( API )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

describe( '<ReferralModeBand>', () => {
	beforeEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	test( '“Got it” folds the steps into one line, and “How it works” opens them again, keeping focus', async () => {
		mockPreferences();
		nock( API )
			.persist()
			.post( '/rest/v1.1/me/preferences' )
			.reply( 200, ( _uri, body ) => body as nock.Body );
		render( <ReferralModeBand kind="products" />, { queryClient } );

		expect( await screen.findByText( 'Send your client a payment request' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Got it' } ) );
		expect( await screen.findByText( /Referring to clients\./ ) ).toBeVisible();
		expect( screen.queryByText( 'Send your client a payment request' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'How it works' } ) ).toHaveFocus();

		await userEvent.click( screen.getByRole( 'button', { name: 'How it works' } ) );
		expect( await screen.findByText( 'Send your client a payment request' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Got it' } ) ).toHaveFocus();
	} );
} );
