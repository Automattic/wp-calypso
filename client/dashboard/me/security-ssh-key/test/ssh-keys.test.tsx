/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SshKeys from '../ssh-keys';
import type { UserSshKey } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const VALID_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample wojtek@macbook';

const buildKey = ( overrides: Partial< UserSshKey > = {} ): UserSshKey => ( {
	name: 'default',
	label: 'Default',
	key: 'ssh-ed25519 AAAA',
	type: 'ssh-ed25519',
	sha256: 'SHA256:default',
	created_at: '2026-10-01T10:00:00+00:00',
	updated_at: '2026-10-01T10:00:00+00:00',
	site_ids: [],
	...overrides,
} );

const mockSshKeys = ( sshKeys: UserSshKey[] ) =>
	nock( API ).get( '/wpcom/v2/me/ssh-keys' ).reply( 200, sshKeys );

const openActionsMenu = async ( label: string ) => {
	await userEvent.click( await screen.findByRole( 'button', { name: `Actions for ${ label }` } ) );
};

describe( '<SshKeys>', () => {
	test( 'lists every key with its label, fingerprint and attached site count', async () => {
		mockSshKeys( [
			buildKey(),
			buildKey( {
				name: 'ci-deploys',
				label: 'CI deploys',
				sha256: 'SHA256:ci',
				site_ids: [ 1, 2 ],
			} ),
		] );

		render( <SshKeys /> );

		expect( await screen.findByText( 'Default' ) ).toBeVisible();
		expect( screen.getByText( 'CI deploys' ) ).toBeVisible();
		expect( screen.getByText( 'SHA256:ci' ) ).toBeVisible();
		expect( screen.getByText( /Attached to 2 sites/ ) ).toBeVisible();
		expect( screen.getByText( /Not attached to any sites/ ) ).toBeVisible();
		expect( screen.queryByText( 'ci-deploys' ) ).not.toBeInTheDocument();
	} );

	test( 'adds a key with a label prefilled from the key comment', async () => {
		mockSshKeys( [] );
		const scope = nock( API )
			.post( '/wpcom/v2/me/ssh-keys', ( body ) => {
				expect( body ).toEqual( { label: 'wojtek@macbook', key: VALID_KEY } );
				return true;
			} )
			.reply( 200, buildKey( { label: 'wojtek@macbook', name: 'wojtek-macbook' } ) );

		const { recordTracksEvent } = render( <SshKeys /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Add SSH key' } ) );
		const dialog = screen.getByRole( 'dialog', { name: 'Add SSH key' } );
		await userEvent.click( within( dialog ).getByLabelText( 'Public SSH key' ) );
		await userEvent.paste( VALID_KEY );

		expect( within( dialog ).getByLabelText( 'Label' ) ).toHaveValue( 'wojtek@macbook' );

		await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Add SSH key' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_security_ssh_key_create_click',
			{ key_count: 0 }
		);
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
	} );

	test( 'keeps a label the user typed when the key changes', async () => {
		mockSshKeys( [] );

		render( <SshKeys /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Add SSH key' } ) );
		const dialog = screen.getByRole( 'dialog', { name: 'Add SSH key' } );
		await userEvent.type( within( dialog ).getByLabelText( 'Label' ), 'Work laptop' );
		await userEvent.click( within( dialog ).getByLabelText( 'Public SSH key' ) );
		await userEvent.paste( VALID_KEY );

		expect( within( dialog ).getByLabelText( 'Label' ) ).toHaveValue( 'Work laptop' );
	} );

	test( 'disables adding keys at the limit', async () => {
		mockSshKeys(
			Array.from( { length: 10 }, ( _, index ) =>
				buildKey( { name: `key-${ index }`, label: `Key ${ index }`, sha256: `SHA256:${ index }` } )
			)
		);

		render( <SshKeys /> );

		expect( await screen.findByRole( 'button', { name: 'Add SSH key' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getByText( /You can add up to 10 SSH keys/ ) ).toBeVisible();
	} );

	test( 'edits only the label when the key field is left empty', async () => {
		mockSshKeys( [ buildKey( { name: 'laptop', label: 'Laptop' } ) ] );
		const scope = nock( API )
			.post( '/wpcom/v2/me/ssh-keys/laptop', ( body ) => {
				expect( body ).toEqual( { label: 'Personal MacBook' } );
				return true;
			} )
			.reply( 200, buildKey( { name: 'laptop', label: 'Personal MacBook' } ) );

		render( <SshKeys /> );

		await openActionsMenu( 'Laptop' );
		await userEvent.click( screen.getByRole( 'menuitem', { name: 'Edit' } ) );
		const dialog = screen.getByRole( 'dialog', { name: 'Edit SSH key' } );
		const input = within( dialog ).getByLabelText( 'Label' );
		await userEvent.clear( input );
		await userEvent.type( input, 'Personal MacBook' );
		await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'replaces only the key when the label is unchanged', async () => {
		mockSshKeys( [ buildKey( { name: 'laptop', label: 'Laptop' } ) ] );
		const scope = nock( API )
			.post( '/wpcom/v2/me/ssh-keys/laptop', ( body ) => {
				expect( body ).toEqual( { key: VALID_KEY } );
				return true;
			} )
			.reply( 200, buildKey( { name: 'laptop', label: 'Laptop' } ) );

		render( <SshKeys /> );

		await openActionsMenu( 'Laptop' );
		await userEvent.click( screen.getByRole( 'menuitem', { name: 'Edit' } ) );
		const dialog = screen.getByRole( 'dialog', { name: 'Edit SSH key' } );
		await userEvent.click( within( dialog ).getByLabelText( 'New public SSH key (optional)' ) );
		await userEvent.paste( VALID_KEY );
		await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'changes the label and the key together', async () => {
		mockSshKeys( [ buildKey( { name: 'laptop', label: 'Laptop' } ) ] );
		const scope = nock( API )
			.post( '/wpcom/v2/me/ssh-keys/laptop', ( body ) => {
				expect( body ).toEqual( { label: 'New laptop', key: VALID_KEY } );
				return true;
			} )
			.reply( 200, buildKey( { name: 'laptop', label: 'New laptop' } ) );

		render( <SshKeys /> );

		await openActionsMenu( 'Laptop' );
		await userEvent.click( screen.getByRole( 'menuitem', { name: 'Edit' } ) );
		const dialog = screen.getByRole( 'dialog', { name: 'Edit SSH key' } );
		const input = within( dialog ).getByLabelText( 'Label' );
		await userEvent.clear( input );
		await userEvent.type( input, 'New laptop' );
		await userEvent.click( within( dialog ).getByLabelText( 'New public SSH key (optional)' ) );
		await userEvent.paste( VALID_KEY );
		await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'disables saving until something changes', async () => {
		mockSshKeys( [ buildKey( { name: 'laptop', label: 'Laptop' } ) ] );

		render( <SshKeys /> );

		await openActionsMenu( 'Laptop' );
		await userEvent.click( screen.getByRole( 'menuitem', { name: 'Edit' } ) );

		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
	} );

	test( 'does not save an invalid public key', async () => {
		mockSshKeys( [ buildKey( { name: 'laptop', label: 'Laptop' } ) ] );
		const scope = nock( API ).post( '/wpcom/v2/me/ssh-keys/laptop' ).reply( 200, {} );

		render( <SshKeys /> );

		await openActionsMenu( 'Laptop' );
		await userEvent.click( screen.getByRole( 'menuitem', { name: 'Edit' } ) );
		await userEvent.click( screen.getByLabelText( 'New public SSH key (optional)' ) );
		await userEvent.paste( 'ssh-dss AAAA' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save' } ) );

		expect( scope.isDone() ).toBe( false );
		expect( screen.getByRole( 'dialog', { name: 'Edit SSH key' } ) ).toBeVisible();
	} );

	test( 'deletes a key after confirming how many sites it is detached from', async () => {
		mockSshKeys( [ buildKey( { name: 'laptop', label: 'Laptop', site_ids: [ 1, 2, 3 ] } ) ] );
		const scope = nock( API ).delete( '/wpcom/v2/me/ssh-keys/laptop' ).reply( 200, {} );

		render( <SshKeys /> );

		await openActionsMenu( 'Laptop' );
		await userEvent.click( screen.getByRole( 'menuitem', { name: 'Delete' } ) );

		expect(
			screen.getByText(
				'Are you sure you want to delete the SSH key “Laptop”? It will be detached from 3 sites.'
			)
		).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Delete SSH key' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );
} );
