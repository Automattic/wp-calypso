/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../test-utils';
import SshCard from '../ssh-card';

const siteId = 123;
const sftpUsers = [ { username: 'example.wordpress.com', password: '' } ];

describe( '<SshCard>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ siteId }/hosting/ssh-keys` )
			.reply( 200, { ssh_keys: [] } );
	} );

	afterEach( () => {
		nock.cleanAll();
		select( noticesStore )
			.getNotices()
			.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
	} );

	test( 'keeps the SSH settings hidden and the toggle disabled while user SSH keys load', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/me/ssh-keys' )
			.delay( 100 )
			.reply( 200, [ { name: 'default', key: 'ssh-rsa AAAA', sha256: 'abc', created_at: '' } ] );

		render( <SshCard siteId={ siteId } sftpUsers={ sftpUsers } sshEnabled /> );

		const toggle = screen.getByRole( 'checkbox', { name: 'Enable SSH access for this site' } );
		expect( toggle ).toBeDisabled();
		expect( screen.queryByText( 'Connection command' ) ).not.toBeInTheDocument();

		expect( await screen.findByText( 'Connection command' ) ).toBeVisible();
		expect( toggle ).toBeEnabled();
	} );

	test( 'does not load user SSH keys when SSH is disabled', () => {
		render( <SshCard siteId={ siteId } sftpUsers={ sftpUsers } sshEnabled={ false } /> );

		expect(
			screen.getByRole( 'checkbox', { name: 'Enable SSH access for this site' } )
		).toBeEnabled();
		expect( screen.queryByText( 'Connection command' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the enabled snackbar only after user SSH keys have loaded', async () => {
		const user = userEvent.setup();
		let resolveUserSshKeys: () => void = () => {};
		const userSshKeysLoaded = new Promise< void >( ( resolve ) => {
			resolveUserSshKeys = resolve;
		} );
		const enableRequest = nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/sites/${ siteId }/hosting/ssh-access`, { setting: 'ssh' } )
			.reply( 200, { setting: 'ssh' } );
		const userSshKeysRequest = nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/me/ssh-keys' )
			.reply( async () => {
				await userSshKeysLoaded;
				return [ 200, [] ];
			} );

		render( <SshCard siteId={ siteId } sftpUsers={ sftpUsers } sshEnabled={ false } /> );

		await user.click( screen.getByRole( 'checkbox', { name: 'Enable SSH access for this site' } ) );
		await waitFor( () => expect( enableRequest.isDone() ).toBe( true ) );
		await waitFor( () => expect( userSshKeysRequest.isDone() ).toBe( true ) );
		expect( select( noticesStore ).getNotices() ).toEqual( [] );

		resolveUserSshKeys();

		await waitFor( () =>
			expect( select( noticesStore ).getNotices() ).toEqual( [
				expect.objectContaining( {
					content: 'SSH access has been successfully enabled for this site.',
				} ),
			] )
		);
	} );
} );
