/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import UserProfileSettings from '..';
import type { ReaderUser } from '@automattic/api-core';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( '../profile-identity-card', () => () => <div data-testid="identity-card" /> );
jest.mock( '../profile-visibility-card', () => () => <div data-testid="visibility-card" /> );
jest.mock( '../sites-visibility-card', () => () => <div data-testid="sites-card" /> );

jest.mock( 'calypso/reader/data/user-profile/use-set-profile-tab-visibility', () => ( {
	useSetProfileTabVisibility: () => ( { setVisibility: jest.fn(), isPending: false } ),
} ) );

describe( 'UserProfileSettings', () => {
	const { useSelector } = jest.requireMock( 'calypso/state' );
	const user: ReaderUser = {
		ID: 123,
		user_login: 'test_user',
		nice_name: 'nice_name',
		display_name: 'Test User',
		avatar_URL: '',
		first_name: '',
		last_name: '',
		description: '',
		profile_URL: '',
	};

	let queryClient: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
		queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	} );

	function renderWithClient( ui: React.ReactNode ) {
		return render( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
	}

	test( 'renders the settings cards for the profile owner', () => {
		useSelector.mockReturnValue( { username: 'test_user' } );

		renderWithClient( <UserProfileSettings user={ user } /> );

		expect( screen.getByTestId( 'identity-card' ) ).toBeVisible();
		expect( screen.getByTestId( 'visibility-card' ) ).toBeVisible();
		expect( screen.getByTestId( 'sites-card' ) ).toBeVisible();
	} );

	test( 'renders nothing when viewing another user profile', () => {
		useSelector.mockReturnValue( { username: 'someone_else' } );

		const { container } = renderWithClient( <UserProfileSettings user={ user } /> );

		expect( container ).toBeEmptyDOMElement();
		expect( screen.queryByTestId( 'identity-card' ) ).not.toBeInTheDocument();
	} );
} );
