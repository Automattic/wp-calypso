/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { UnifiedInviteAccept } from '../index';

const mockNormalizeInvite = jest.fn();

jest.mock( 'calypso/my-sites/invites/invite-accept/utils/normalize-invite', () => ( {
	__esModule: true,
	default: ( inviteData: unknown ) => mockNormalizeInvite( inviteData ),
} ) );

const mockLoggedOutInviteAccept = jest.fn();

jest.mock( 'calypso/my-sites/invites/invite-accept-logged-out', () => ( {
	__esModule: true,
	default: ( props: unknown ) => {
		mockLoggedOutInviteAccept( props );
		return <div data-testid="logged-out-invite-screen">LoggedOutInviteAccept</div>;
	},
} ) );

// Mock AcceptInviteScreen to simplify testing
jest.mock( '../screens/accept-invite-screen', () => ( {
	__esModule: true,
	default: () => <div data-testid="accept-invite-screen">AcceptInviteScreen</div>,
} ) );

jest.mock( '../screens/already-member-screen', () => ( {
	__esModule: true,
	default: () => <div data-testid="already-member-screen">AlreadyMemberScreen</div>,
} ) );

const mockStore = configureStore();

const defaultProps = {
	siteId: '123',
	inviteKey: 'abc123',
	inviteData: {
		blog_details: {
			title: 'Test Store',
			domain: 'test.store',
		},
		invite: {
			meta: {
				role: 'administrator',
			},
		},
	},
};

describe( 'UnifiedInviteAccept', () => {
	beforeEach( () => {
		mockNormalizeInvite.mockReset();
		mockLoggedOutInviteAccept.mockClear();
		mockNormalizeInvite.mockReturnValue( {
			inviteKey: 'abc123',
			role: 'administrator',
			sentTo: 'test@example.com',
			site: {
				ID: 123,
				domain: 'test.store',
				title: 'Test Store',
			},
		} );
	} );

	test( 'renders logged-out invite screen when user is not logged in', () => {
		const store = mockStore( {
			currentUser: {
				id: null,
			},
		} );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } />
			</Provider>
		);

		expect( screen.getByTestId( 'logged-out-invite-screen' ) ).toBeVisible();
	} );

	test( 'renders AcceptInviteScreen when user is logged in', () => {
		const store = mockStore( {
			currentUser: {
				id: 1,
			},
		} );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } />
			</Provider>
		);

		expect( mockLoggedOutInviteAccept ).not.toHaveBeenCalled();
		expect( screen.getByTestId( 'accept-invite-screen' ) ).toBeInTheDocument();
	} );

	test( 'passes activationKey and authKey to logged-out invite screen', () => {
		const store = mockStore( {
			currentUser: {
				id: null,
			},
		} );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } activationKey="activation123" authKey="auth456" />
			</Provider>
		);

		expect( mockLoggedOutInviteAccept ).toHaveBeenCalledWith(
			expect.objectContaining( {
				invite: expect.objectContaining( {
					activationKey: 'activation123',
					authKey: 'auth456',
				} ),
				forceMatchingEmail: false,
			} )
		);
	} );

	test( 'passes invite data through normalizeInvite for logged-out flow', () => {
		const store = mockStore( {
			currentUser: {
				id: null,
			},
		} );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } />
			</Provider>
		);

		expect( mockNormalizeInvite ).toHaveBeenCalledWith( defaultProps.inviteData );
		expect( mockLoggedOutInviteAccept ).toHaveBeenCalledWith(
			expect.objectContaining( {
				invite: expect.objectContaining( {
					role: 'administrator',
					sentTo: 'test@example.com',
				} ),
			} )
		);
	} );

	test( 'renders AlreadyMemberScreen for already_member error', () => {
		const store = mockStore( { currentUser: { id: 1 } } );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept
					{ ...defaultProps }
					inviteError={ { error: 'already_member', message: 'Already a member' } }
				/>
			</Provider>
		);

		expect( screen.getByTestId( 'already-member-screen' ) ).toBeVisible();
		expect( screen.queryByTestId( 'accept-invite-screen' ) ).not.toBeInTheDocument();
	} );

	test( 'renders AlreadyMemberScreen for already_subscribed error', () => {
		const store = mockStore( { currentUser: { id: 1 } } );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept
					{ ...defaultProps }
					inviteError={ { error: 'already_subscribed', message: 'Already subscribed' } }
				/>
			</Provider>
		);

		expect( screen.getByTestId( 'already-member-screen' ) ).toBeVisible();
	} );

	test( 'renders AcceptInviteScreen when there is no error', () => {
		const store = mockStore( { currentUser: { id: 1 } } );

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept { ...defaultProps } />
			</Provider>
		);

		expect( screen.queryByTestId( 'already-member-screen' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'accept-invite-screen' ) ).toBeVisible();
	} );
} );
