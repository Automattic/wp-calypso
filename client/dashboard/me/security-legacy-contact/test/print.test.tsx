/** @jest-environment jsdom */
import { queryClient } from '@automattic/api-queries';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SecurityLegacyContactPrint from '../print';

const API = 'https://public-api.wordpress.com';
const CONTACT = {
	legacy_contact_id: 123,
	contact_email: 'trusted@example.com',
	created_at: '2026-01-01T00:00:00+00:00',
};
const CONTACT_WITH_KEY = {
	...CONTACT,
	access_key: 'abc-123-key',
};

const interceptContacts = ( contacts: Array< typeof CONTACT > ) =>
	nock( API ).get( '/wpcom/v2/me/legacy-contacts' ).query( true ).reply( 200, contacts );

const interceptContact = ( contact: typeof CONTACT_WITH_KEY ) =>
	nock( API )
		.get( `/wpcom/v2/me/legacy-contacts/${ contact.legacy_contact_id }` )
		.query( true )
		.reply( 200, contact );

const renderScreen = () => render( <SecurityLegacyContactPrint />, { queryClient } );

describe( '<SecurityLegacyContactPrint />', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	test( 'shows the contact details and how to claim access', async () => {
		interceptContacts( [ CONTACT ] );
		interceptContact( CONTACT_WITH_KEY );

		renderScreen();

		expect( await screen.findByText( CONTACT.contact_email ) ).toBeVisible();
		expect( screen.getByText( CONTACT_WITH_KEY.access_key ) ).toBeVisible();
		expect( screen.getByText( 'How to claim access' ) ).toBeVisible();

		const link = screen.getByRole( 'link', { name: 'wordpress.com/digital-legacy' } );
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/digital-legacy' );
	} );

	test( 'shows the empty state when no contact is set up', async () => {
		interceptContacts( [] );

		renderScreen();

		expect(
			await screen.findByText( 'You don’t have a legacy contact set up yet.' )
		).toBeVisible();
		expect( await screen.findByRole( 'link', { name: 'Back to legacy contact' } ) ).toBeVisible();
	} );
} );
