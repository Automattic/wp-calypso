/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import InviteTeamMemberModal from '../invite-team-member-modal';

const API = 'https://public-api.wordpress.com';

describe( '<InviteTeamMemberModal>', () => {
	test( 'shows the validation message as a field error and does not send an empty invite', async () => {
		const user = userEvent.setup();
		const request = nock( API ).post( '/wpcom/v2/agency/1/user-invites' ).reply( 200 );

		render( <InviteTeamMemberModal agencyId={ 1 } onClose={ jest.fn() } /> );
		await user.click( screen.getByRole( 'button', { name: 'Send invite' } ) );

		const message = await screen.findByText(
			'Please enter a valid email or WordPress.com username.'
		);
		expect( message ).toBeVisible();
		expect(
			screen.getByRole( 'textbox', { name: 'Email or WordPress.com username' } )
		).toHaveProperty(
			'validationMessage',
			'Please enter a valid email or WordPress.com username.'
		);
		expect( request.isDone() ).toBe( false );
	} );

	test( 'sends the invite and closes when the field is filled', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const request = nock( API )
			.post( '/wpcom/v2/agency/1/user-invites', {
				login: 'ada@example.com',
				message: 'Welcome aboard',
			} )
			.reply( 200, { success: true } );

		render( <InviteTeamMemberModal agencyId={ 1 } onClose={ onClose } /> );
		await user.type(
			screen.getByRole( 'textbox', { name: 'Email or WordPress.com username' } ),
			' ada@example.com '
		);
		await user.type( screen.getByRole( 'textbox', { name: 'Message' } ), 'Welcome aboard' );
		await user.click( screen.getByRole( 'button', { name: 'Send invite' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( request.isDone() ).toBe( true );
	} );
} );
