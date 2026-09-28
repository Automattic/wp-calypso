/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AcceptTeamInvite from '../index';

const API = 'https://public-api.wordpress.com';
const INVITE_PATH = '/wpcom/v2/agency/5/user-invites/7';

function mockUserAgencies( agencies: Array< { id: number; name: string } > ) {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, agencies.length ? agencies : { is_client_user: false } );
}

function alreadyMemberError() {
	return {
		code: 'a4a_user_invite_already_member_of_agency',
		message: 'You are already a member of another agency.',
		data: {
			user_agencies: [ { id: 1, name: 'Current Agency' } ],
			target_agency: { id: 5, name: 'Target Agency' },
		},
	};
}

describe( '<AcceptTeamInvite>', () => {
	test( 'activates the membership and lands on the overview', async () => {
		mockUserAgencies( [] );
		const scope = nock( API )
			.post( INVITE_PATH, ( body ) => {
				expect( body ).toEqual( { agencyId: 5, inviteId: 7, secret: 'a-secret' } );
				return true;
			} )
			.reply( 200, { success: true } );

		const { router } = render(
			<AcceptTeamInvite agencyId={ 5 } inviteId={ 7 } secret="a-secret" />
		);

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( router.state.location.pathname ).toBe( '/overview' ) );
	} );

	test( 'explains that only one agency dashboard can be joined at a time', async () => {
		mockUserAgencies( [ { id: 1, name: 'Current Agency' } ] );
		nock( API ).post( INVITE_PATH ).reply( 403, alreadyMemberError() );

		render( <AcceptTeamInvite agencyId={ 5 } inviteId={ 7 } secret="a-secret" /> );

		expect(
			await screen.findByText( 'You can only join one agency dashboard at a time.' )
		).toBeVisible();
		expect(
			screen.getByText( 'To join Target Agency, first leave the Current Agency dashboard.' )
		).toBeVisible();
		expect( screen.getByText( 'Leave the Current Agency dashboard' ) ).toBeVisible();
		expect( screen.getByText( 'Join the Target Agency dashboard' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Go to Team' } ) ).toHaveAttribute(
			'href',
			'/agency/team'
		);
		expect(
			screen.getByRole( 'button', { name: 'Team members Knowledge Base article' } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Contact support' } ) ).toHaveAttribute(
			'href',
			'#contact-support'
		);
	} );

	test( 'sends a member of the invited agency to the overview without using the invite', async () => {
		mockUserAgencies( [ { id: 5, name: 'Target Agency' } ] );
		const scope = nock( API ).post( INVITE_PATH ).reply( 400, { code: 'rest_invalid_param' } );

		const { router } = render(
			<AcceptTeamInvite agencyId={ 5 } inviteId={ 7 } secret="a-secret" />
		);

		await waitFor( () => expect( router.state.location.pathname ).toBe( '/overview' ) );
		expect( scope.isDone() ).toBe( false );
	} );

	test.each( [
		{
			code: 'rest_invalid_param',
			message: 'Invalid parameter(s): secret',
			shown:
				'This invite is no longer valid. It may have been used, cancelled, or replaced by a newer one. Ask the agency to send you a new invite.',
		},
		{
			code: 'a4a_user_invite_expired',
			message: 'User invite has expired.',
			shown: 'This invite has expired. Ask the agency to send you a new one.',
		},
		{
			code: 'some_other_error',
			message: 'Something else went wrong.',
			shown: 'Something else went wrong.',
		},
	] )(
		'explains the $code error on the invalid link notice',
		async ( { code, message, shown } ) => {
			mockUserAgencies( [] );
			nock( API ).post( INVITE_PATH ).reply( 400, { code, message } );

			render( <AcceptTeamInvite agencyId={ 5 } inviteId={ 7 } secret="a-secret" /> );

			expect( await screen.findByText( 'Invalid invite link' ) ).toBeVisible();
			expect( screen.getByText( shown ) ).toBeVisible();
		}
	);

	test( 'asks for the invitation email again when the link has no details', async () => {
		mockUserAgencies( [] );
		const scope = nock( API ).post( INVITE_PATH ).reply( 200, { success: true } );

		render( <AcceptTeamInvite agencyId={ 5 } /> );

		expect( await screen.findByText( 'Invalid invite link' ) ).toBeVisible();
		expect(
			screen.getByText(
				'This link is incomplete. Open the link in your invite email again, or ask the agency to send you a new invite.'
			)
		).toBeVisible();
		expect( scope.isDone() ).toBe( false );
	} );
} );
