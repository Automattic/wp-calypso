/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
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
} );
