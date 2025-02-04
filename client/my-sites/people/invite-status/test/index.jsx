/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import invites from 'calypso/state/invites/reducer';
import siteSettings from 'calypso/state/site-settings/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import InviteStatus from '../index';

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { invites, siteSettings, ui } } );

describe( 'InviteStatus', () => {
	const siteObject = { ID: 1337, slug: 'foo.wordpress.com' };

	const pendingInviteObject = {
		key: '123456asdf789',
		role: 'follower',
		isPending: true,
		inviteDate: '2018-01-28T17:22:16+00:00',
		acceptedDate: null,
		user: {
			login: 'chicken',
			email: false,
			name: 'Pollo',
			avatar_URL:
				'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
		},
		invitedBy: {
			login: 'cow',
			name: 'Vaca',
			avatar_URL:
				'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
		},
	};

	const acceptedInviteObject = {
		key: 'jkl789asd12345',
		role: 'subscriber',
		isPending: false,
		inviteDate: '2018-01-28T17:22:16+00:00',
		acceptedDate: '2018-01-28T17:22:20+00:00',
		user: {
			login: 'grilledchicken',
			email: false,
			name: 'Pollo Asado',
			avatar_URL:
				'https://2.gravatar.com/avatar/eba3ff8480f481053bbd52b2a08c6136?s=96&d=identicon&r=G',
		},
		invitedBy: {
			login: 'cow',
			name: 'Vaca',
			avatar_URL:
				'https://2.gravatar.com/avatar/e2c5df270c7adcd0f6a70fa9cfde7d0f?s=96&d=identicon&r=G',
		},
	};

	it( 'should display Revoke Invite (pending invite)', async () => {
		render(
			<InviteStatus site={ siteObject } invite={ pendingInviteObject } type="invite-details" />
		);

		const RevokeButton = screen.getByRole( 'button', { name: /^Revoke$/i } );
		expect( RevokeButton ).toBeVisible();
	} );

	it( 'should display onResend (pending invite)', async () => {
		render(
			<InviteStatus site={ siteObject } invite={ pendingInviteObject } type="invite-details" />
		);

		const resendButton = screen.getByRole( 'button', { name: /^Resend Invite$/i } );
		expect( resendButton ).toBeVisible();
	} );

	it( 'should display Clear Invite (accepted invite)', async () => {
		render(
			<InviteStatus site={ siteObject } invite={ acceptedInviteObject } type="invite-details" />
		);

		const clearInviteButton = screen.getByRole( 'button', { name: /^Clear$/i } );
		expect( clearInviteButton ).toBeVisible();
	} );
} );
