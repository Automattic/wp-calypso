/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { UnifiedInviteAccept } from '../index';

const mockNormalizeInvite = jest.fn();
const mockTopBar = jest.fn();

jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		TopBar: ( props: { logo?: React.ReactNode } ) => {
			mockTopBar( props );
			return (
				<div data-testid="invite-top-bar">
					{ props.logo ? <div data-testid="invite-top-bar-logo">{ props.logo }</div> : null }
				</div>
			);
		},
	},
} ) );

jest.mock( 'calypso/lib/partner-branding', () => ( {
	getCiabConfigFromGarden: () => ( {
		compactLogo: {
			src: 'https://example.com/compact-logo.svg',
			alt: 'Compact Logo',
			width: 32,
			height: 32,
		},
		logo: {
			src: 'https://example.com/logo.svg',
			alt: 'Logo',
			width: 120,
			height: 32,
		},
	} ),
} ) );

jest.mock( 'calypso/my-sites/invites/invite-accept/utils/normalize-invite', () => ( {
	__esModule: true,
	default: ( inviteData: unknown ) => mockNormalizeInvite( inviteData ),
} ) );

const mockLoggedOutInviteAccept = jest.fn();
const mockAlreadyMemberScreen = jest.fn();
const mockInvalidInviteScreen = jest.fn();

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
	default: ( props: unknown ) => {
		mockAlreadyMemberScreen( props );
		return <div data-testid="already-member-screen">AlreadyMemberScreen</div>;
	},
} ) );

jest.mock( '../screens/invalid-invite-screen', () => ( {
	__esModule: true,
	default: ( props: unknown ) => {
		mockInvalidInviteScreen( props );
		return <div data-testid="invalid-invite-screen">InvalidInviteScreen</div>;
	},
} ) );

jest.mock( '../style.scss', () => ( {} ) );

const mockStore = configureStore();

const defaultProps = {
	siteId: '123',
	inviteKey: 'abc123',
	inviteData: {
		blog_details: {
			title: 'Test Store',
			domain: 'test.store',
			is_garden_site: true,
			garden: {
				partner: 'woo',
				name: 'commerce',
			},
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
		mockTopBar.mockClear();
		mockLoggedOutInviteAccept.mockClear();
		mockAlreadyMemberScreen.mockClear();
		mockInvalidInviteScreen.mockClear();
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
		const topBar = screen.getByTestId( 'invite-top-bar' );
		expect( topBar ).toBeVisible();
		expect( screen.getByTestId( 'invite-top-bar-logo' ) ).toBeVisible();
		const shell = screen
			.getByTestId( 'logged-out-invite-screen' )
			.closest( '.invites-unified__logged-out-shell' );
		expect( shell ).not.toBeNull();
		expect( topBar.closest( '.invites-unified__logged-out-layout' ) ).not.toBeNull();
		expect(
			topBar.compareDocumentPosition( shell as Node ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBe( Node.DOCUMENT_POSITION_FOLLOWING );
		expect( mockTopBar.mock.calls[ 0 ][ 0 ].logo ).toBeDefined();
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
		expect( mockNormalizeInvite ).not.toHaveBeenCalled();
	} );

	test( 'does not normalize invite data for logged-in already-member flow with partial invite data', () => {
		const store = mockStore( { currentUser: { id: 1 } } );
		const partialInviteData = {
			blog_details: {
				title: 'Test Store',
				domain: 'test.store',
			},
		};

		render(
			<Provider store={ store }>
				<UnifiedInviteAccept
					{ ...defaultProps }
					inviteData={ partialInviteData }
					inviteError={ { error: 'already_member', message: 'Already a member' } }
				/>
			</Provider>
		);

		expect( screen.getByTestId( 'already-member-screen' ) ).toBeVisible();
		expect( mockNormalizeInvite ).not.toHaveBeenCalled();
		expect( mockAlreadyMemberScreen ).toHaveBeenCalledWith(
			expect.objectContaining( {
				blogDetails: partialInviteData.blog_details,
			} )
		);
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

	describe( 'invalid invite errors', () => {
		test.each( [
			[ 'unauthorized_created_by_self', 'You cannot use an invite that you created' ],
			[ 'invalid_input_invite_used', 'This invite has already been used' ],
			[ 'invalid_input_incorrect_site', 'This invite is for a different site' ],
			[ 'unknown_invite', 'This invite does not exist' ],
		] )( 'renders InvalidInviteScreen for %s error when logged in', ( errorCode, errorMessage ) => {
			const store = mockStore( { currentUser: { id: 1 } } );

			render(
				<Provider store={ store }>
					<UnifiedInviteAccept
						{ ...defaultProps }
						inviteError={ { error: errorCode, message: errorMessage } }
					/>
				</Provider>
			);

			expect( screen.getByTestId( 'invalid-invite-screen' ) ).toBeVisible();
			expect( screen.queryByTestId( 'accept-invite-screen' ) ).not.toBeInTheDocument();
			expect( mockInvalidInviteScreen ).toHaveBeenCalledWith(
				expect.objectContaining( {
					inviteError: { error: errorCode, message: errorMessage },
				} )
			);
		} );

		test.each( [
			[ 'unauthorized_created_by_self', 'You cannot use an invite that you created' ],
			[ 'invalid_input_invite_used', 'This invite has already been used' ],
			[ 'invalid_input_incorrect_site', 'This invite is for a different site' ],
			[ 'unknown_invite', 'This invite does not exist' ],
		] )(
			'renders InvalidInviteScreen for %s error when logged out',
			( errorCode, errorMessage ) => {
				const store = mockStore( { currentUser: { id: null } } );

				render(
					<Provider store={ store }>
						<UnifiedInviteAccept
							{ ...defaultProps }
							inviteError={ { error: errorCode, message: errorMessage } }
						/>
					</Provider>
				);

				expect( screen.getByTestId( 'invalid-invite-screen' ) ).toBeVisible();
				expect( screen.queryByTestId( 'logged-out-invite-screen' ) ).not.toBeInTheDocument();
				expect( mockInvalidInviteScreen ).toHaveBeenCalledWith(
					expect.objectContaining( {
						inviteError: { error: errorCode, message: errorMessage },
					} )
				);
			}
		);
	} );
} );
