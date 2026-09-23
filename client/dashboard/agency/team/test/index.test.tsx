/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import AgencyTeam from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{ id: AGENCY_ID, name: 'Test Agency', user: { capabilities: [ 'a4a_edit_user_invites' ] } },
		] )
		.persist();
}

function mockPreferences( answered = false ) {
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: answered
				? { 'a4a-feedback': { 'team-member-invite-sent': { lastSubmittedAt: 1757000000000 } } }
				: {},
		} )
		.persist();
}

function mockTeam() {
	nock( API ).get( `/wpcom/v2/agency/${ AGENCY_ID }/users` ).reply( 200, [] ).persist();
	nock( API ).get( `/wpcom/v2/agency/${ AGENCY_ID }/user-invites` ).reply( 200, [] ).persist();
}

function mockInvite() {
	nock( API )
		.post( `/wpcom/v2/agency/${ AGENCY_ID }/user-invites` )
		.reply( 200, { success: true } );
}

async function invite() {
	const user = userEvent.setup();
	await user.click( await screen.findByRole( 'button', { name: 'Invite a team member' } ) );
	await user.type(
		screen.getByRole( 'textbox', { name: /Email or WordPress.com username/ } ),
		'nina@example.com'
	);
	await user.click( screen.getByRole( 'button', { name: 'Send invite' } ) );
	return user;
}

describe( '<AgencyTeam>', () => {
	beforeEach( () => nock.cleanAll() );

	test( 'asks how the invite went, naming the address', async () => {
		// SnackbarList reaches for window.scrollTo, which jsdom does not implement.
		window.scrollTo = jest.fn();
		mockAgency();
		mockPreferences();
		mockTeam();
		mockInvite();

		render(
			<>
				<AgencyTeam />
				<Snackbars />
			</>
		);
		await invite();

		expect( await screen.findByText( 'Invite emailed!' ) ).toBeVisible();
		expect( screen.getByText( /We sent nina@example.com an invite/ ) ).toBeVisible();
		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText( 'The invitation has been successfully sent.' );
		expect( notice ).toBeVisible();
	} );

	test( 'does not ask a partner who already answered, but still confirms the invite', async () => {
		// SnackbarList reaches for window.scrollTo, which jsdom does not implement.
		window.scrollTo = jest.fn();
		mockAgency();
		mockPreferences( true );
		mockTeam();
		mockInvite();

		render(
			<>
				<AgencyTeam />
				<Snackbars />
			</>
		);
		await invite();

		await waitFor( () =>
			expect( screen.queryByRole( 'button', { name: 'Send invite' } ) ).not.toBeInTheDocument()
		);
		expect( screen.queryByText( 'Invite emailed!' ) ).not.toBeInTheDocument();
		// The notice text also lands in the a11y live region, so this matches twice.
		const [ notice ] = await screen.findAllByText( 'The invitation has been successfully sent.' );
		expect( notice ).toBeVisible();
	} );
} );
