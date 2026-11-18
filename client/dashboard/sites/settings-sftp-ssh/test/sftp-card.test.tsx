/**
 * @vitest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SftpCard from '../sftp-card';

const siteId = 123;
const username = 'example.wordpress.com';

describe( '<SftpCard>', () => {
	test( 'keeps the reset password button visible while the password is displayed', async () => {
		render( <SftpCard siteId={ siteId } sftpUsers={ [ { username, password: 'secret' } ] } /> );

		await screen.findByText( 'Learn more' );
		expect( screen.getByRole( 'button', { name: 'Reset password' } ) ).toBeVisible();
	} );

	test( 'temporarily disables the reset password button after confirming a reset', async () => {
		const user = userEvent.setup();
		const resetRequest = nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/sites/${ siteId }/hosting/ssh-user/${ username }/reset-password` )
			.reply( 200, JSON.stringify( { username, password: 'new-secret' } ), {
				'Content-Type': 'application/json',
			} );

		render( <SftpCard siteId={ siteId } sftpUsers={ [ { username, password: '' } ] } /> );

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Reset password' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Reset password' } ) );

		await waitFor( () => expect( resetRequest.isDone() ).toBe( true ) );

		const resetButton = screen.getByRole( 'button', {
			name: 'Reset password',
			description: 'You reset the password recently. Please wait a minute and try again.',
		} );
		expect( resetButton ).toHaveAttribute( 'aria-disabled', 'true' );

		await user.hover( resetButton );
		expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent(
			'You reset the password recently. Please wait a minute and try again.'
		);
	} );

	test( 'deletes the SFTP user after confirming Disable SFTP', async () => {
		const user = userEvent.setup();
		const deleteRequest = nock( 'https://public-api.wordpress.com' )
			.delete( `/wpcom/v2/sites/${ siteId }/hosting/ssh-user/${ username }` )
			.reply( 200, JSON.stringify( { username } ), { 'Content-Type': 'application/json' } );

		render(
			<SftpCard siteId={ siteId } sftpUsers={ [ { username, password: '' } ] } sshMayBeEnabled />
		);

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Disable SFTP' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).toHaveTextContent( 'SSH access is turned off too' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Disable SFTP' } ) );

		await waitFor( () => expect( deleteRequest.isDone() ).toBe( true ) );
	} );

	test( 'does not mention SSH in the Disable SFTP dialog when SSH access is off', async () => {
		const user = userEvent.setup();

		render( <SftpCard siteId={ siteId } sftpUsers={ [ { username, password: '' } ] } /> );

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Disable SFTP' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).not.toHaveTextContent( 'SSH' );
	} );

	test( 'deletes every SFTP user when a site has more than one', async () => {
		const user = userEvent.setup();
		const secondUsername = 'example.wordpress.com_ab12';
		const deleteRequests = nock( 'https://public-api.wordpress.com' )
			.delete( `/wpcom/v2/sites/${ siteId }/hosting/ssh-user/${ username }` )
			.reply( 200, JSON.stringify( { username } ), { 'Content-Type': 'application/json' } )
			.delete( `/wpcom/v2/sites/${ siteId }/hosting/ssh-user/${ secondUsername }` )
			.reply( 200, JSON.stringify( { username: secondUsername } ), {
				'Content-Type': 'application/json',
			} );

		render(
			<SftpCard
				siteId={ siteId }
				sftpUsers={ [
					{ username, password: '' },
					{ username: secondUsername, password: '' },
				] }
			/>
		);

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Disable SFTP' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Disable SFTP' } ) );

		await waitFor( () => expect( deleteRequests.isDone() ).toBe( true ) );
	} );

	test( 'disables Reset password while SFTP is being disabled', async () => {
		const user = userEvent.setup();
		let release!: () => void;
		const pending = new Promise< void >( ( resolve ) => {
			release = resolve;
		} );
		const deleteRequest = nock( 'https://public-api.wordpress.com' )
			.delete( `/wpcom/v2/sites/${ siteId }/hosting/ssh-user/${ username }` )
			.reply( 200, () => pending.then( () => JSON.stringify( { username } ) ), {
				'Content-Type': 'application/json',
			} );

		render( <SftpCard siteId={ siteId } sftpUsers={ [ { username, password: '' } ] } /> );

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Disable SFTP' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Disable SFTP' } ) );

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Reset password' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			)
		);

		release();
		await waitFor( () => expect( deleteRequest.isDone() ).toBe( true ) );
	} );
} );
