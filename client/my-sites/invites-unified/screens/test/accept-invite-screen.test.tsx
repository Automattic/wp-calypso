/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { AcceptInviteScreen } from '../accept-invite-screen';
import type { Invite } from '../../types';

// Mock external dependencies
jest.mock(
	'@automattic/calypso-router',
	() => ( {
		__esModule: true,
		default: jest.fn(),
	} ),
	{ virtual: true }
);

jest.mock(
	'@automattic/i18n-utils',
	() => ( {
		localizeUrl: ( url: string ) => url,
	} ),
	{ virtual: true }
);

jest.mock(
	'@automattic/onboarding',
	() => ( {
		Step: {
			Heading: ( { text, subText }: { text: string; subText: string } ) => (
				<div data-testid="step-heading">
					<h1>{ text }</h1>
					<p>{ subText }</p>
				</div>
			),
			TopBar: ( { logo }: { logo?: React.ReactNode } ) => (
				<div data-testid="step-topbar">{ logo }</div>
			),
			CenteredColumnLayout: ( {
				children,
				heading,
				topBar,
			}: {
				children: React.ReactNode;
				heading: React.ReactNode;
				topBar: React.ReactNode;
			} ) => (
				<div data-testid="step-layout">
					{ topBar }
					{ heading }
					{ children }
				</div>
			),
		},
	} ),
	{ virtual: true }
);

jest.mock( 'calypso/components/connect-screen/action-buttons', () => ( {
	ActionButtons: ( {
		primaryLabel,
		primaryOnClick,
		primaryLoading,
		secondaryLabel,
		secondaryOnClick,
		tertiaryLabel,
		tertiaryOnClick,
	}: {
		primaryLabel: string;
		primaryOnClick: () => void;
		primaryLoading: boolean;
		secondaryLabel: string;
		secondaryOnClick: () => void;
		tertiaryLabel: string;
		tertiaryOnClick: () => void;
	} ) => (
		<div data-testid="action-buttons">
			<button data-testid="primary-button" onClick={ primaryOnClick } disabled={ primaryLoading }>
				{ primaryLabel }
			</button>
			<button data-testid="secondary-button" onClick={ secondaryOnClick }>
				{ secondaryLabel }
			</button>
			<button data-testid="tertiary-button" onClick={ tertiaryOnClick }>
				{ tertiaryLabel }
			</button>
		</div>
	),
} ) );

jest.mock( 'calypso/components/connect-screen/consent-text', () => ( {
	ConsentText: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="consent-text">{ children }</div>
	),
} ) );

jest.mock( 'calypso/components/connect-screen/user-card', () => ( {
	UserCard: ( { user }: { user: { displayName: string; email: string } } ) => (
		<div data-testid="user-card">
			<span data-testid="user-display-name">{ user.displayName }</span>
			<span data-testid="user-email">{ user.email }</span>
		</div>
	),
} ) );

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/layout/body-section-css-class', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const mockRecordTracksEvent = jest.fn();
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

const mockNavigate = jest.fn();
jest.mock( 'calypso/lib/navigate', () => ( {
	navigate: ( url: string ) => mockNavigate( url ),
} ) );

const mockWooBranding = {
	logo: {
		src: 'https://example.com/woo-logo.png',
		alt: 'Woo',
		width: 100,
		height: 30,
	},
};

jest.mock( 'calypso/lib/partner-branding', () => ( {
	getCiabConfigFromGarden: ( partner: string, name: string ) => {
		if ( partner === 'woo' && name === 'commerce' ) {
			return mockWooBranding;
		}
		return null;
	},
} ) );

jest.mock( 'calypso/lib/paths', () => ( {
	login: ( { redirectTo }: { redirectTo: string } ) =>
		`/log-in?redirect_to=${ encodeURIComponent( redirectTo ) }`,
} ) );

const mockGetRedirectAfterAccept = jest.fn( () => '/redirect-url' );
jest.mock( 'calypso/my-sites/invites/utils', () => ( {
	getRedirectAfterAccept: ( ...args: Parameters< typeof mockGetRedirectAfterAccept > ) =>
		mockGetRedirectAfterAccept( ...args ),
} ) );

const mockDispatch = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

const mockGetCurrentUser = jest.fn();
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: ( state: unknown ) => mockGetCurrentUser( state ),
} ) );

jest.mock( 'calypso/state/dashboard/selectors/has-dashboard-opt-in', () => ( {
	hasDashboardOptIn: () => false,
} ) );

const mockAcceptInvite = jest.fn();
jest.mock( 'calypso/state/invites/actions', () => ( {
	acceptInvite: ( ...args: unknown[] ) => mockAcceptInvite( ...args ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	infoNotice: jest.fn(),
	errorNotice: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	hideMasterbar: jest.fn( () => ( { type: 'HIDE_MASTERBAR' } ) ),
} ) );

jest.mock( '../email-mismatch-screen', () => ( {
	__esModule: true,
	default: ( { inviteSentTo }: { inviteSentTo: string } ) => (
		<div data-testid="email-mismatch-screen">Email mismatch: { inviteSentTo }</div>
	),
} ) );

jest.mock( '../style.scss', () => ( {} ) );

const mockStore = configureStore();

const createInvite = ( overrides: Partial< Invite > = {} ): Invite =>
	( {
		inviteKey: 'test-invite-key',
		activationKey: 'test-activation-key',
		blog_details: {
			title: 'Test Store',
			domain: 'test.store',
			URL: 'https://test.store',
			admin_url: 'https://test.store/wp-admin',
			is_vip: false,
			...overrides.blog_details,
		},
		invite: {
			blog_id: '123',
			meta: {
				role: 'administrator',
				sent_to: 'invited@example.com',
				known: false,
				force_matching_email: false,
				...overrides.invite?.meta,
			},
			...overrides.invite,
		},
		...overrides,
	} ) as Invite;

const defaultUser = {
	ID: 1,
	display_name: 'Test User',
	email: 'test@example.com',
	avatar_URL: 'https://example.com/avatar.jpg',
};

const createStore = () => mockStore( {} );

const setupUser = ( userOverrides = {} ) => {
	const user = { ...defaultUser, ...userOverrides };
	mockGetCurrentUser.mockReturnValue( user );
	return user;
};

describe( 'AcceptInviteScreen', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockAcceptInvite.mockReturnValue( { type: 'ACCEPT_INVITE' } );
		mockDispatch.mockImplementation( ( action: unknown ) => {
			if ( typeof action === 'function' ) {
				return action();
			}
			return action;
		} );
		setupUser();
	} );

	describe( 'rendering', () => {
		test( 'renders the user card with current user info', () => {
			const store = createStore();
			const invite = createInvite();

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect( screen.getByTestId( 'user-card' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'user-display-name' ) ).toHaveTextContent( 'Test User' );
			expect( screen.getByTestId( 'user-email' ) ).toHaveTextContent( 'test@example.com' );
		} );

		test( 'renders action buttons', () => {
			const store = createStore();
			const invite = createInvite();

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect( screen.getByTestId( 'primary-button' ) ).toHaveTextContent( 'Join' );
			expect( screen.getByTestId( 'secondary-button' ) ).toHaveTextContent( 'Cancel' );
			expect( screen.getByTestId( 'tertiary-button' ) ).toHaveTextContent(
				'Log in with another account'
			);
		} );
	} );

	describe( 'role-based button labels', () => {
		test( 'shows "Follow" button for follower role', () => {
			const store = createStore();
			const invite = createInvite( {
				invite: {
					blog_id: '123',
					invite_slug: 'test',
					meta: { role: 'follower', sent_to: 'test@example.com', blog_id: 123 },
				},
			} );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect( screen.getByTestId( 'primary-button' ) ).toHaveTextContent( 'Follow' );
		} );
	} );

	describe( 'role descriptions', () => {
		test( 'shows administrator description', () => {
			const store = createStore();
			const invite = createInvite( {
				invite: {
					blog_id: '123',
					invite_slug: 'test',
					meta: { role: 'administrator', sent_to: 'test@example.com', blog_id: 123 },
				},
			} );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect( screen.getByText( /manage all aspects of the store/i ) ).toBeInTheDocument();
		} );

		test( 'shows follower description', () => {
			const store = createStore();
			const invite = createInvite( {
				invite: {
					blog_id: '123',
					invite_slug: 'test',
					meta: { role: 'follower', sent_to: 'test@example.com', blog_id: 123 },
				},
			} );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect(
				screen.getByText( /read the latest posts in the WordPress.com Reader/i )
			).toBeInTheDocument();
		} );
	} );

	describe( 'email mismatch', () => {
		test( 'shows EmailMismatchScreen when force_matching_email is true and emails differ', () => {
			setupUser( { email: 'different@example.com' } );
			const store = createStore();
			const invite = createInvite( {
				invite: {
					blog_id: '123',
					invite_slug: 'test',
					meta: {
						role: 'administrator',
						sent_to: 'invited@example.com',
						force_matching_email: true,
						blog_id: 123,
					},
				},
			} );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect( screen.getByTestId( 'email-mismatch-screen' ) ).toBeInTheDocument();
			expect( screen.getByText( /invited@example.com/i ) ).toBeInTheDocument();
		} );

		test( 'does not show EmailMismatchScreen when emails match', () => {
			setupUser( { email: 'invited@example.com' } );
			const store = createStore();
			const invite = createInvite( {
				invite: {
					blog_id: '123',
					invite_slug: 'test',
					meta: {
						role: 'administrator',
						sent_to: 'invited@example.com',
						force_matching_email: true,
						blog_id: 123,
					},
				},
			} );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect( screen.queryByTestId( 'email-mismatch-screen' ) ).not.toBeInTheDocument();
			expect( screen.getByTestId( 'action-buttons' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'accept flow', () => {
		test( 'calls acceptInvite and navigates on success', async () => {
			const store = createStore();
			const invite = createInvite();
			mockAcceptInvite.mockReturnValue( () => Promise.resolve() );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			fireEvent.click( screen.getByTestId( 'primary-button' ) );

			await waitFor( () => {
				expect( mockAcceptInvite ).toHaveBeenCalled();
				expect( mockNavigate ).toHaveBeenCalledWith( '/redirect-url' );
			} );
		} );

		test( 'tracks join button click', async () => {
			const store = createStore();
			const invite = createInvite();
			mockAcceptInvite.mockReturnValue( () => Promise.resolve() );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			fireEvent.click( screen.getByTestId( 'primary-button' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_invite_accept_logged_in_join_button_click',
				expect.objectContaining( { role: 'administrator', unified: true } )
			);
		} );
	} );

	describe( 'decline flow', () => {
		test( 'redirects to home on decline', () => {
			const page = require( '@automattic/calypso-router' ).default;
			const store = createStore();
			const invite = createInvite();

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			fireEvent.click( screen.getByTestId( 'secondary-button' ) );

			expect( page ).toHaveBeenCalledWith( '/' );
		} );

		test( 'tracks decline button click', () => {
			const store = createStore();
			const invite = createInvite();

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			fireEvent.click( screen.getByTestId( 'secondary-button' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_invite_accept_logged_in_decline_button_click',
				expect.objectContaining( { role: 'administrator', unified: true } )
			);
		} );
	} );

	describe( 'switch account flow', () => {
		test( 'navigates to login URL on switch account click', () => {
			const store = createStore();
			const invite = createInvite();

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			fireEvent.click( screen.getByTestId( 'tertiary-button' ) );

			expect( mockNavigate ).toHaveBeenCalledWith( expect.stringContaining( '/log-in' ) );
		} );

		test( 'tracks switch account click', () => {
			const store = createStore();
			const invite = createInvite();

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			fireEvent.click( screen.getByTestId( 'tertiary-button' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_invite_accept_logged_in_sign_in_link_click',
				expect.objectContaining( { role: 'administrator', unified: true } )
			);
		} );
	} );

	describe( 'tracking', () => {
		test( 'tracks page load on mount', () => {
			const store = createStore();
			const invite = createInvite();

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_invite_accept_load_page',
				expect.objectContaining( { logged_in: true, unified: true } )
			);
		} );
	} );

	describe( 'CIAB branding', () => {
		test( 'shows logo for Woo commerce garden sites', () => {
			const store = createStore();
			const invite = createInvite( {
				blog_details: {
					title: 'Woo Store',
					domain: 'woo.store',
					URL: 'https://woo.store',
					is_garden_site: true,
					garden: {
						partner: 'woo',
						name: 'commerce',
					},
				},
			} );

			render(
				<Provider store={ store }>
					<AcceptInviteScreen invite={ invite } />
				</Provider>
			);

			const logo = screen.getByRole( 'img' );
			expect( logo ).toHaveAttribute( 'src', 'https://example.com/woo-logo.png' );
			expect( logo ).toHaveAttribute( 'alt', 'Woo' );
		} );
	} );
} );
