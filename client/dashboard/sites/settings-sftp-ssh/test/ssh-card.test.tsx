/**
 * @jest-environment jsdom
 */

import { sshKeysQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../test-utils';
import SshCard from '../ssh-card';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn();
	return Object.assign( fn, { __esModule: true, default: fn, isEnabled: jest.fn() } );
} );

const siteId = 123;
const sftpUsers = [ { username: 'example.wordpress.com', password: '' } ];

describe( '<SshCard>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ siteId }/hosting/ssh-keys` )
			.reply( 200, { ssh_keys: [] } );
	} );

	afterEach( () => {
		select( noticesStore )
			.getNotices()
			.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
	} );

	test( 'keeps the SSH settings hidden and the toggle disabled while user SSH keys load', async () => {
		let resolveUserSshKeys: () => void = () => {};
		const userSshKeysLoaded = new Promise< void >( ( resolve ) => {
			resolveUserSshKeys = resolve;
		} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/me/ssh-keys' )
			.reply( async () => {
				await userSshKeysLoaded;
				return [ 200, [ { name: 'default', key: 'ssh-rsa AAAA', sha256: 'abc', created_at: '' } ] ];
			} );

		render( <SshCard siteId={ siteId } sftpUsers={ sftpUsers } sshEnabled /> );

		const toggle = screen.getByRole( 'checkbox', { name: 'Enable SSH access for this site' } );
		expect( toggle ).toBeDisabled();
		expect( screen.queryByText( 'Connection command' ) ).not.toBeInTheDocument();

		resolveUserSshKeys();

		expect( await screen.findByText( 'Connection command' ) ).toBeVisible();
		expect( toggle ).toBeEnabled();
	} );

	test( 'waits for user SSH keys to refetch even when they are already cached', async () => {
		let resolveUserSshKeys: () => void = () => {};
		const userSshKeysLoaded = new Promise< void >( ( resolve ) => {
			resolveUserSshKeys = resolve;
		} );
		const userSshKeysRequest = nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/me/ssh-keys' )
			.reply( async () => {
				await userSshKeysLoaded;
				return [ 200, [] ];
			} );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( sshKeysQuery().queryKey, [] );

		render( <SshCard siteId={ siteId } sftpUsers={ sftpUsers } sshEnabled />, { queryClient } );

		await waitFor( () => expect( userSshKeysRequest.isDone() ).toBe( true ) );
		expect(
			screen.getByRole( 'checkbox', { name: 'Enable SSH access for this site' } )
		).toBeDisabled();
		expect( screen.queryByText( 'Connection command' ) ).not.toBeInTheDocument();

		resolveUserSshKeys();

		expect( await screen.findByText( 'Connection command' ) ).toBeVisible();
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

	test( 'offers the user’s key when only other users’ keys are attached', async () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ siteId }/hosting/ssh-keys` )
			.reply( 200, {
				ssh_keys: [
					{ user_login: 'otheruser', name: 'default', sha256: 'abc', attached_at: '2026-10-02' },
				],
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/me/ssh-keys' )
			.reply( 200, [ { name: 'default', key: 'ssh-rsa AAAA', sha256: 'def', created_at: '' } ] );

		render( <SshCard siteId={ siteId } sftpUsers={ sftpUsers } sshEnabled /> );

		expect( await screen.findByText( 'otheruser-default' ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'Attach another SSH key' } ) ).toHaveValue(
			'default'
		);
	} );

	describe( 'with multiple SSH keys enabled', () => {
		const userSshKey = ( name: string, label?: string ) => ( {
			name,
			label,
			key: 'ssh-ed25519 AAAA',
			type: 'ssh-ed25519',
			sha256: `SHA256:${ name }`,
			created_at: '2026-10-01T00:00:00Z',
			updated_at: '2026-10-01T00:00:00Z',
			site_ids: [],
		} );
		const siteSshKey = ( user_login: string, name: string, label?: string ) => ( {
			user_login,
			name,
			label,
			sha256: `SHA256:${ user_login }-${ name }`,
			attached_at: '2026-10-02T00:00:00Z',
		} );

		const renderCard = ( {
			userSshKeys,
			siteSshKeys,
		}: {
			userSshKeys: ReturnType< typeof userSshKey >[];
			siteSshKeys: ReturnType< typeof siteSshKey >[];
		} ) => {
			nock.cleanAll();
			nock( 'https://public-api.wordpress.com' )
				.get( `/wpcom/v2/sites/${ siteId }/hosting/ssh-keys` )
				.reply( 200, { ssh_keys: siteSshKeys } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/me/ssh-keys' )
				.reply( 200, userSshKeys );

			return render( <SshCard siteId={ siteId } sftpUsers={ sftpUsers } sshEnabled /> );
		};

		beforeEach( () => {
			jest.mocked( isEnabled ).mockImplementation( ( flag ) => flag === 'ssh-multiple-keys' );
		} );

		afterEach( () => {
			jest.mocked( isEnabled ).mockReset();
			nock.cleanAll();
		} );

		test( 'shows labels of attached keys, with the owner for other users’ keys', async () => {
			renderCard( {
				userSshKeys: [ userSshKey( 'laptop', 'Personal laptop' ) ],
				siteSshKeys: [
					siteSshKey( 'testuser', 'laptop', 'Personal laptop' ),
					siteSshKey( 'otheruser', 'ci', 'CI deploys' ),
					siteSshKey( 'otheruser', 'default' ),
				],
			} );

			expect( await screen.findByText( 'Personal laptop' ) ).toBeVisible();
			expect( screen.getByText( 'CI deploys (otheruser)' ) ).toBeVisible();
			expect( screen.getByText( 'default (otheruser)' ) ).toBeVisible();
		} );

		test( 'lets the user attach keys that are not attached yet', async () => {
			const user = userEvent.setup();
			renderCard( {
				userSshKeys: [
					userSshKey( 'laptop', 'Personal laptop' ),
					userSshKey( 'ci', 'CI deploys' ),
					userSshKey( 'desktop', 'Desktop' ),
				],
				siteSshKeys: [
					siteSshKey( 'testuser', 'laptop', 'Personal laptop' ),
					siteSshKey( 'otheruser', 'ci', 'CI deploys' ),
				],
			} );

			const select = await screen.findByRole( 'combobox', { name: 'Attach another SSH key' } );
			expect( screen.getAllByRole( 'option' ).map( ( option ) => option.textContent ) ).toEqual( [
				'CI deploys',
				'Desktop',
			] );
			expect( select ).toHaveValue( 'ci' );

			await user.selectOptions( select, 'desktop' );
			const attachRequest = nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/sites/${ siteId }/hosting/ssh-keys`, { name: 'desktop' } )
				.reply( 200, {} );
			nock( 'https://public-api.wordpress.com' )
				.get( `/wpcom/v2/sites/${ siteId }/hosting/ssh-keys` )
				.reply( 200, { ssh_keys: [] } );
			await user.click( screen.getByRole( 'button', { name: 'Attach SSH key to site' } ) );

			await waitFor( () => expect( attachRequest.isDone() ).toBe( true ) );
		} );

		test( 'offers the user’s keys when only other users’ keys are attached', async () => {
			renderCard( {
				userSshKeys: [ userSshKey( 'laptop', 'Personal laptop' ) ],
				siteSshKeys: [
					siteSshKey( 'otheruser', 'ci', 'CI deploys' ),
					siteSshKey( 'otheruser', 'desktop', 'Desktop' ),
				],
			} );

			expect( await screen.findByText( 'CI deploys (otheruser)' ) ).toBeVisible();
			expect( screen.getByRole( 'combobox', { name: 'Attach another SSH key' } ) ).toHaveValue(
				'laptop'
			);
		} );

		test( 'hides the attach form once every key of the user is attached', async () => {
			renderCard( {
				userSshKeys: [
					userSshKey( 'laptop', 'Personal laptop' ),
					userSshKey( 'ci', 'CI deploys' ),
				],
				siteSshKeys: [
					siteSshKey( 'testuser', 'laptop', 'Personal laptop' ),
					siteSshKey( 'testuser', 'ci', 'CI deploys' ),
				],
			} );

			expect( await screen.findByText( 'CI deploys' ) ).toBeVisible();
			expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: 'Attach SSH key to site' } )
			).not.toBeInTheDocument();
		} );
	} );
} );
