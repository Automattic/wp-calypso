/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import InviteTeamMemberModal from '../invite-team-member-modal';

const mockNavigate = jest.fn();

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

function mockAgency() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 42, name: 'A', url: 'x' } ] );
}

function mockPreferences( feedbackByType: Record< string, unknown > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: { 'a4a-feedback': feedbackByType } } );
}

function mockInvite() {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/wpcom/v2/agency/42/user-invites' )
		.reply( 200, { success: true } );
}

describe( '<InviteTeamMemberModal>', () => {
	beforeEach( () => {
		mockNavigate.mockClear();
		nock.cleanAll();
	} );

	test( 'navigates to the feedback survey after a successful invite when not yet shown', async () => {
		mockAgency();
		mockPreferences();
		mockInvite();

		render( <InviteTeamMemberModal agencyId={ 42 } onClose={ jest.fn() } /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: /Email or WordPress\.com username/ } ),
			'a@b.com'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Send invite' } ) );

		await waitFor( () =>
			expect( mockNavigate ).toHaveBeenCalledWith( {
				to: '/feedback',
				search: { type: 'team-member-invite-sent', returnTo: '/team', email: 'a@b.com' },
			} )
		);
	} );

	test( 'closes the modal and shows a success notice after a successful invite', async () => {
		mockAgency();
		mockPreferences();
		mockInvite();

		const onClose = jest.fn();
		render( <InviteTeamMemberModal agencyId={ 42 } onClose={ onClose } /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: /Email or WordPress\.com username/ } ),
			'a@b.com'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Send invite' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
	} );

	test( 'does not navigate to the feedback survey when it has already been shown', async () => {
		mockAgency();
		mockPreferences( { 'team-member-invite-sent': { lastSubmittedAt: 123 } } );
		mockInvite();

		const onClose = jest.fn();
		render( <InviteTeamMemberModal agencyId={ 42 } onClose={ onClose } /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: /Email or WordPress\.com username/ } ),
			'a@b.com'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Send invite' } ) );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );
} );
