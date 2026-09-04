/**
 * @jest-environment jsdom
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
} );
