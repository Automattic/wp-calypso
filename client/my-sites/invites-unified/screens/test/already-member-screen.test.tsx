/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { AlreadyMemberScreen } from '../already-member-screen';

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

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
		variant,
	}: {
		children: React.ReactNode;
		onClick: () => void;
		variant: string;
	} ) => (
		<button data-testid="switch-account-button" data-variant={ variant } onClick={ onClick }>
			{ children }
		</button>
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

jest.mock( 'calypso/lib/partner-branding', () => ( {
	getCiabConfigFromGarden: ( partner: string, name: string ) => {
		if ( partner === 'woo' && name === 'commerce' ) {
			return {
				logo: {
					src: 'https://example.com/woo-logo.png',
					alt: 'Woo',
					width: 100,
					height: 30,
				},
			};
		}
		return null;
	},
} ) );

jest.mock( 'calypso/lib/paths', () => ( {
	login: ( { redirectTo }: { redirectTo: string } ) =>
		`/log-in?redirect_to=${ encodeURIComponent( redirectTo ) }`,
} ) );

const mockGetCurrentUser = jest.fn();
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: ( state: unknown ) => mockGetCurrentUser( state ),
} ) );

const mockDispatch = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	hideMasterbar: jest.fn( () => ( { type: 'HIDE_MASTERBAR' } ) ),
} ) );

jest.mock( '../style.scss', () => ( {} ) );

const mockStore = configureStore();

const defaultUser = {
	ID: 1,
	display_name: 'Mike Tillman',
	email: 'mike.tillman@gmail.com',
	avatar_URL: 'https://example.com/avatar.jpg',
};

const createStore = () => mockStore( {} );

const setupUser = ( userOverrides = {} ) => {
	const user = { ...defaultUser, ...userOverrides };
	mockGetCurrentUser.mockReturnValue( user );
	return user;
};

describe( 'AlreadyMemberScreen', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockDispatch.mockReturnValue( undefined );
		setupUser();
	} );

	describe( 'rendering', () => {
		test( 'renders the title and description', () => {
			const store = createStore();

			render(
				<Provider store={ store }>
					<AlreadyMemberScreen />
				</Provider>
			);

			expect( screen.getByText( 'You are already a member of this site' ) ).toBeVisible();
			expect(
				screen.getByText( 'Would you like to accept the invite with a different account?' )
			).toBeVisible();
		} );

		test( 'renders the user card with current user info', () => {
			const store = createStore();

			render(
				<Provider store={ store }>
					<AlreadyMemberScreen />
				</Provider>
			);

			expect( screen.getByTestId( 'user-card' ) ).toBeVisible();
			expect( screen.getByTestId( 'user-display-name' ) ).toHaveTextContent( 'Mike Tillman' );
			expect( screen.getByTestId( 'user-email' ) ).toHaveTextContent( 'mike.tillman@gmail.com' );
		} );

		test( 'renders "Log in with a different account" link button', () => {
			const store = createStore();

			render(
				<Provider store={ store }>
					<AlreadyMemberScreen />
				</Provider>
			);

			const button = screen.getByTestId( 'switch-account-button' );
			expect( button ).toHaveTextContent( 'Log in with a different account' );
			expect( button ).toHaveAttribute( 'data-variant', 'link' );
		} );

		test( 'shows branding logo for Woo commerce garden sites', () => {
			const store = createStore();

			render(
				<Provider store={ store }>
					<AlreadyMemberScreen
						blogDetails={ {
							title: '',
							domain: '',
							URL: '',
							is_garden_site: true,
							garden: { partner: 'woo', name: 'commerce' },
						} }
					/>
				</Provider>
			);

			const logo = screen.getByRole( 'img' );
			expect( logo ).toHaveAttribute( 'src', 'https://example.com/woo-logo.png' );
			expect( logo ).toHaveAttribute( 'alt', 'Woo' );
		} );
	} );

	describe( 'switch account flow', () => {
		test( 'navigates to login URL on switch account click', async () => {
			const user = userEvent.setup();
			const store = createStore();

			render(
				<Provider store={ store }>
					<AlreadyMemberScreen />
				</Provider>
			);

			await user.click( screen.getByText( 'Log in with a different account' ) );

			expect( mockNavigate ).toHaveBeenCalledWith( expect.stringContaining( '/log-in' ) );
		} );

		test( 'tracks switch account click', async () => {
			const user = userEvent.setup();
			const store = createStore();

			render(
				<Provider store={ store }>
					<AlreadyMemberScreen />
				</Provider>
			);

			await user.click( screen.getByText( 'Log in with a different account' ) );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_invite_already_member_switch_account_click',
				expect.objectContaining( { unified: true } )
			);
		} );
	} );

	describe( 'tracking', () => {
		test( 'tracks page load on mount', () => {
			const store = createStore();

			render(
				<Provider store={ store }>
					<AlreadyMemberScreen
						blogDetails={ {
							title: '',
							domain: '',
							URL: '',
							is_garden_site: true,
							garden: { partner: 'woo', name: 'commerce' },
						} }
					/>
				</Provider>
			);

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_invite_already_member_load_page',
				expect.objectContaining( {
					logged_in: true,
					unified: true,
					garden_name: 'commerce',
					garden_partner: 'woo',
				} )
			);
		} );
	} );
} );
