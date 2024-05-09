/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import invites from 'calypso/state/invites/reducer';
import siteSettings from 'calypso/state/site-settings/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { invites, siteSettings, ui } } );

const mockGoBack = jest.fn();
jest.mock( '@automattic/calypso-router', () => ( { back: mockGoBack } ) );
jest.mock( 'calypso/data/external-contributors/use-external-contributors', () => () => false );

describe( 'PeopleInviteDetails', () => {
	let PeopleInviteDetails;

	const mockTranslate = ( msg ) => msg;
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

	beforeAll( () => {
		// Load the component here instead of via an `import` to ensure that it
		// is loaded after we've mocked some of its dependencies.
		PeopleInviteDetails = require( '../index' ).PeopleInviteDetails;
	} );

	beforeEach( () => {
		mockGoBack.mockReset();
	} );

	it( 'should trigger deletion upon clicking Revoke Invite (pending invite)', async () => {
		const user = userEvent.setup();
		const mockDeleteInvite = jest.fn();

		render(
			<PeopleInviteDetails
				site={ siteObject }
				requesting={ false }
				deleting={ false }
				deleteSuccess={ false }
				inviteKey={ pendingInviteObject.key }
				invite={ pendingInviteObject }
				deleteInvite={ mockDeleteInvite }
				translate={ mockTranslate }
				moment={ moment }
				canViewPeople
			/>
		);

		const revokeInviteButton = screen.getByRole( 'button', { name: /^Revoke$/i } );
		expect( revokeInviteButton ).toBeVisible();

		expect( mockDeleteInvite ).not.toHaveBeenCalled();
		await user.click( revokeInviteButton );
		expect( mockDeleteInvite ).toHaveBeenCalledTimes( 1 );
		expect( mockDeleteInvite ).toHaveBeenCalledWith( siteObject.ID, pendingInviteObject.key );
	} );

	it( 'should trigger deletion upon clicking Clear Invite (accepted invite)', async () => {
		const mockDeleteInvite = jest.fn();

		render(
			<PeopleInviteDetails
				site={ siteObject }
				requesting={ false }
				deleting={ false }
				deleteSuccess={ false }
				inviteKey={ acceptedInviteObject.key }
				invite={ acceptedInviteObject }
				deleteInvite={ mockDeleteInvite }
				translate={ mockTranslate }
				moment={ moment }
				canViewPeople
			/>
		);

		const clearInviteButton = screen.getByRole( 'button', { name: /^Clear$/i } );
		expect( clearInviteButton ).toBeVisible();

		expect( mockDeleteInvite ).not.toHaveBeenCalled();
		await userEvent.click( clearInviteButton );
		expect( mockDeleteInvite ).toHaveBeenCalledTimes( 1 );
		expect( mockDeleteInvite ).toHaveBeenCalledWith( siteObject.ID, acceptedInviteObject.key );
	} );

	it( 'should navigate back (to the invite list) when an invite is deleted', () => {
		const props = {
			site: siteObject,
			requesting: false,
			deleting: true,
			deleteSuccess: false,
			inviteKey: acceptedInviteObject.key,
			invite: acceptedInviteObject,
			translate: mockTranslate,
			moment,
			canViewPeople: true,
		};
		const { rerender } = render( <PeopleInviteDetails { ...props } /> );

		expect( mockGoBack ).not.toHaveBeenCalled();

		// Verify that `page.back` is called when the invite deletion succeeds.
		rerender( <PeopleInviteDetails { ...props } deleting={ false } deleteSuccess /> );
		expect( mockGoBack ).toHaveBeenCalledTimes( 1 );
		expect( mockGoBack ).toHaveBeenCalledWith( '/people/invites/' + siteObject.slug );

		// Change another prop and verify that `page.back` isn't called again.
		rerender( <PeopleInviteDetails { ...props } invite={ { ...acceptedInviteObject } } /> );
		expect( mockGoBack ).toHaveBeenCalledTimes( 1 );
	} );
} );
