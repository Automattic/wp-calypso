/** @jest-environment jsdom */
import { queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SecurityLegacyContact from '../index';

const API = 'https://public-api.wordpress.com';
const CONTACT = {
	legacy_contact_id: 123,
	contact_email: 'trusted@example.com',
	created_at: '2026-01-01T00:00:00+00:00',
};

const interceptContacts = ( contacts: Array< typeof CONTACT > ) =>
	nock( API ).get( '/wpcom/v2/me/legacy-contacts' ).query( true ).reply( 200, contacts );

const removeButton = () => screen.findByRole( 'button', { name: 'Remove legacy contact' } );
const confirmDialog = () => screen.queryByRole( 'dialog' );
const confirmRemoveButton = () => screen.findByRole( 'button', { name: 'Remove' } );
const cancelButton = () => screen.findByRole( 'button', { name: 'Cancel' } );

// The remove mutation reads/writes the shared api-queries query client, so the
// component must render against that same client (rather than a throwaway one)
// for the cache updates to be reflected in the UI.
const renderScreen = () => render( <SecurityLegacyContact />, { queryClient } );

describe( '<SecurityLegacyContact />', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	test( 'shows the existing contact and a remove button', async () => {
		interceptContacts( [ CONTACT ] );

		renderScreen();

		expect( await screen.findByText( CONTACT.contact_email ) ).toBeVisible();
		expect( await removeButton() ).toBeVisible();
	} );

	test( 'opens a confirmation dialog when removing', async () => {
		interceptContacts( [ CONTACT ] );

		renderScreen();

		await userEvent.click( await removeButton() );

		expect( confirmDialog() ).toBeVisible();
		expect(
			screen.getByText( 'Are you sure you want to remove your legacy contact?' )
		).toBeVisible();
	} );

	test( 'removes the contact and returns to the empty state on confirm', async () => {
		interceptContacts( [ CONTACT ] );
		const removeScope = nock( API )
			.delete( `/wpcom/v2/me/legacy-contacts/${ CONTACT.legacy_contact_id }` )
			.query( true )
			.reply( 200, {} );
		// The mutation invalidates the list, triggering a refetch that now returns
		// no contacts.
		interceptContacts( [] );

		renderScreen();

		await userEvent.click( await removeButton() );
		await userEvent.click( await confirmRemoveButton() );

		await waitFor( () => expect( removeScope.isDone() ).toBe( true ) );

		// The empty state renders the set-up form.
		expect( await screen.findByRole( 'button', { name: 'Add legacy contact' } ) ).toBeVisible();
	} );

	test( 'does not remove the contact when the dialog is cancelled', async () => {
		interceptContacts( [ CONTACT ] );
		const removeScope = nock( API )
			.delete( `/wpcom/v2/me/legacy-contacts/${ CONTACT.legacy_contact_id }` )
			.query( true )
			.reply( 200, {} );

		renderScreen();

		await userEvent.click( await removeButton() );
		await userEvent.click( await cancelButton() );

		await waitFor( () => expect( confirmDialog() ).not.toBeInTheDocument() );
		expect( removeScope.isDone() ).toBe( false );
		// The contact is still shown.
		expect( screen.getByText( CONTACT.contact_email ) ).toBeVisible();
	} );
} );
