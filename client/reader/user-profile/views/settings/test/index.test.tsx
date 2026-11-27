/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useSelector } from 'calypso/state';
import UserProfileSettings from '..';
import type { ReaderUser } from '@automattic/api-core';

vi.mock( 'calypso/state', () => ( {
	useSelector: vi.fn(),
} ) );

vi.mock( '../profile-identity-card', () => ( {
	default: () => <div data-testid="identity-card" />,
} ) );
vi.mock( '../preferences-card', () => ( {
	default: () => <div data-testid="preferences-card" />,
} ) );
vi.mock( '../profile-visibility-card', () => ( {
	default: () => <div data-testid="visibility-card" />,
} ) );
vi.mock( '../sites-visibility-card', () => ( {
	default: () => <div data-testid="sites-card" />,
} ) );

vi.mock( 'calypso/reader/data/user-profile/use-set-profile-tab-visibility', () => ( {
	useSetProfileTabVisibility: () => ( { setVisibility: vi.fn(), isPending: false } ),
} ) );

vi.mock( 'calypso/reader/components/achievements/use-set-achievements-visibility', () => ( {
	__esModule: true,
	default: () => ( { setVisibility: vi.fn(), isPending: false } ),
} ) );

describe( 'UserProfileSettings', () => {
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
		vi.clearAllMocks();
		queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	} );

	function renderWithClient( ui: React.ReactNode ) {
		return render( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
	}

	test( 'renders the settings cards for the profile owner', () => {
		vi.mocked( useSelector ).mockReturnValue( { username: 'test_user' } );

		renderWithClient( <UserProfileSettings user={ user } /> );

		expect( screen.getByTestId( 'identity-card' ) ).toBeVisible();
		expect( screen.getByTestId( 'preferences-card' ) ).toBeVisible();
		expect( screen.getByTestId( 'visibility-card' ) ).toBeVisible();
		expect( screen.getByTestId( 'sites-card' ) ).toBeVisible();
	} );

	test( 'renders nothing when viewing another user profile', () => {
		vi.mocked( useSelector ).mockReturnValue( { username: 'someone_else' } );

		const { container } = renderWithClient( <UserProfileSettings user={ user } /> );

		expect( container ).toBeEmptyDOMElement();
		expect( screen.queryByTestId( 'identity-card' ) ).not.toBeInTheDocument();
	} );
} );
