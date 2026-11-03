/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencyTeam from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function mockTeam( approvalStatus: string ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{
				id: AGENCY_ID,
				approval_status: approvalStatus,
				user: { capabilities: [ 'a4a_edit_user_invites' ] },
			},
		] )
		.persist();
	nock( API ).get( `/wpcom/v2/agency/${ AGENCY_ID }/users` ).reply( 200, [] ).persist();
	nock( API ).get( `/wpcom/v2/agency/${ AGENCY_ID }/user-invites` ).reply( 200, [] ).persist();
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
}

async function clickInvite() {
	render( <AgencyTeam /> );
	const user = userEvent.setup();
	await user.click( await screen.findByRole( 'button', { name: 'Invite a team member' } ) );
}

describe( '<AgencyTeam>', () => {
	test( 'shows the approval gate instead of the invite form to a pending agency', async () => {
		mockTeam( 'pending' );

		await clickInvite();

		expect( await screen.findByText( 'Team invites unlock once you’re approved' ) ).toBeVisible();
		expect( screen.queryByLabelText( 'Email or WordPress.com username' ) ).not.toBeInTheDocument();
	} );

	test( 'opens the invite form for an approved agency', async () => {
		mockTeam( 'approved' );

		await clickInvite();

		expect( await screen.findByLabelText( 'Email or WordPress.com username' ) ).toBeVisible();
	} );
} );
