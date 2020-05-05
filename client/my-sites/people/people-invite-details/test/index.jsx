/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';

const mockGoBack = jest.fn();
jest.mock( 'page', () => ( { back: mockGoBack } ) );

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

	it( 'should trigger deletion upon clicking Revoke Invite (pending invite)', () => {
		const mockDeleteInvite = jest.fn();

		const inviteDetails = shallow(
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
				canViewPeople={ true }
			/>
		);

		const revokeInviteButton = inviteDetails.find( 'Button' );
		expect( revokeInviteButton ).toHaveLength( 1 );
		expect( revokeInviteButton.children() ).toHaveLength( 1 );
		expect( revokeInviteButton.children().text() ).toEqual( 'Revoke invite' );

		expect( mockDeleteInvite ).not.toHaveBeenCalled();
		revokeInviteButton.simulate( 'click' );
		expect( mockDeleteInvite ).toHaveBeenCalledTimes( 1 );
		expect( mockDeleteInvite ).toHaveBeenCalledWith( siteObject.ID, pendingInviteObject.key );
	} );

	it( 'should trigger deletion upon clicking Clear Invite (accepted invite)', () => {
		const mockDeleteInvite = jest.fn();

		const inviteDetails = shallow(
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
				canViewPeople={ true }
			/>
		);

		const clearInviteButton = inviteDetails.find( 'Button' );
		expect( clearInviteButton ).toHaveLength( 1 );
		expect( clearInviteButton.children() ).toHaveLength( 1 );
		expect( clearInviteButton.children().text() ).toEqual( 'Clear invite' );

		expect( mockDeleteInvite ).not.toHaveBeenCalled();
		clearInviteButton.simulate( 'click' );
		expect( mockDeleteInvite ).toHaveBeenCalledTimes( 1 );
		expect( mockDeleteInvite ).toHaveBeenCalledWith( siteObject.ID, acceptedInviteObject.key );
	} );

	it( 'should navigate back (to the invite list) when an invite is deleted', () => {
		const inviteDetails = shallow(
			<PeopleInviteDetails
				site={ siteObject }
				requesting={ false }
				deleting={ true }
				deleteSuccess={ false }
				inviteKey={ acceptedInviteObject.key }
				invite={ acceptedInviteObject }
				translate={ mockTranslate }
				moment={ moment }
				canViewPeople={ true }
			/>
		);

		expect( mockGoBack ).not.toHaveBeenCalled();

		// Verify that `page.back` is called when the invite deletion succeeds.
		inviteDetails.setProps( { deleting: false, deleteSuccess: true } );
		expect( mockGoBack ).toHaveBeenCalledTimes( 1 );
		expect( mockGoBack ).toHaveBeenCalledWith( '/people/invites/' + siteObject.slug );

		// Verify that a placeholder is rendered while waiting for `page.back`
		// to take effect.
		const placeholderContainer = inviteDetails.find( 'Card' );
		expect( placeholderContainer ).toHaveLength( 1 );
		expect( placeholderContainer.children() ).toHaveLength( 1 );
		const placeholder = placeholderContainer.childAt( 0 );
		expect( placeholder.key() ).toEqual( 'people-list-item-placeholder' );

		// Change another prop and verify that `page.back` isn't called again.
		inviteDetails.setProps( { invite: Object.assign( {}, acceptedInviteObject ) } );
		expect( mockGoBack ).toHaveBeenCalledTimes( 1 );
	} );
} );
