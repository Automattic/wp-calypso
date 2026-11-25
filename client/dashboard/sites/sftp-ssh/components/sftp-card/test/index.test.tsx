/**
 * @vitest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../../../app/snackbars';
import { render } from '../../../../../test-utils';
import SftpCard from '../index';

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

	test( 'deletes the credentials after confirming Delete credentials', async () => {
		const user = userEvent.setup();
		const deleteRequest = nock( 'https://public-api.wordpress.com' )
			.delete( `/wpcom/v2/sites/${ siteId }/hosting/ssh-users` )
			.reply( 200, JSON.stringify( { removed_users: [ username ], detached_keys: [] } ), {
				'Content-Type': 'application/json',
			} );

		render(
			<>
				<SftpCard
					siteId={ siteId }
					sftpUsers={ [ { username, password: '' } ] }
					sshState="maybe-enabled"
				/>
				<Snackbars />
			</>
		);

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Delete credentials' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).toHaveTextContent(
			'every SSH key attached to this site is detached, including keys that other users attached.'
		);
		expect( dialog ).toHaveTextContent( 'Then each user has to attach their SSH key again.' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Delete credentials' } ) );

		await waitFor( () => expect( deleteRequest.isDone() ).toBe( true ) );
		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText( 'SFTP/SSH credentials deleted.' );
		expect( notice ).toBeVisible();
	} );

	test( 'does not mention SSH in the Delete credentials dialog on a site without SSH', async () => {
		const user = userEvent.setup();

		render( <SftpCard siteId={ siteId } sftpUsers={ [ { username, password: '' } ] } /> );

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Delete credentials' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).not.toHaveTextContent( 'SSH' );
	} );

	test( 'disables Reset password while the credentials are being deleted', async () => {
		const user = userEvent.setup();
		let release!: () => void;
		const pending = new Promise< void >( ( resolve ) => {
			release = resolve;
		} );
		const deleteRequest = nock( 'https://public-api.wordpress.com' )
			.delete( `/wpcom/v2/sites/${ siteId }/hosting/ssh-users` )
			.reply(
				200,
				() =>
					pending.then( () =>
						JSON.stringify( { removed_users: [ username ], detached_keys: [] } )
					),
				{ 'Content-Type': 'application/json' }
			);

		render( <SftpCard siteId={ siteId } sftpUsers={ [ { username, password: '' } ] } /> );

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Delete credentials' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Delete credentials' } ) );

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Reset password' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			)
		);

		release();
		await waitFor( () => expect( deleteRequest.isDone() ).toBe( true ) );
	} );

	test( 'only mentions the SSH keys when SSH access is known to be off', async () => {
		const user = userEvent.setup();

		render(
			<SftpCard
				siteId={ siteId }
				sftpUsers={ [ { username, password: '' } ] }
				sshState="disabled"
			/>
		);

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Delete credentials' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).toHaveTextContent(
			'Every SSH key attached to this site is also detached, including keys that other users attached.'
		);
		expect( dialog ).toHaveTextContent( 'Then each user has to attach their SSH key again.' );
		expect( dialog ).not.toHaveTextContent( 'SSH access is also turned off' );
	} );

	test( 'shows an error and lets the user try again when deleting fails', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.delete( `/wpcom/v2/sites/${ siteId }/hosting/ssh-users` )
			.reply( 500, JSON.stringify( { code: 'rest_unexpected_error', message: 'Error' } ), {
				'Content-Type': 'application/json',
			} );

		render(
			<>
				<SftpCard siteId={ siteId } sftpUsers={ [ { username, password: '' } ] } />
				<Snackbars />
			</>
		);

		await screen.findByText( 'Learn more' );
		await user.click( screen.getByRole( 'button', { name: 'Delete credentials' } ) );
		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Delete credentials' } ) );

		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText(
			'Failed to delete SFTP/SSH credentials. Please refresh the page and try again.'
		);
		expect( notice ).toBeVisible();
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Delete credentials' } ) ).not.toHaveAttribute(
				'aria-disabled',
				'true'
			)
		);
	} );
} );
