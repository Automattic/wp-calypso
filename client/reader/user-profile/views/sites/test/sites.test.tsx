/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ReaderSite } from 'calypso/reader/sites-list/site-item';
import useUserSitesQuery, {
	UserSitesResponse,
} from 'calypso/reader/user-profile/queries/use-user-sites-query';
import UserSites from '..';
import type { UserProfileData } from 'calypso/lib/user/user';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/reader/user-profile/queries/use-user-sites-query', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

// Mocking ReaderSitesList because it uses useDispatch internally which would require a full Redux store setup.
jest.mock( 'calypso/reader/sites-list', () => ( {
	ReaderSitesList: ( { sites }: { sites: ReaderSite[] } ) => (
		<div data-testid="reader-sites-list">
			{ sites.map( ( site ) => (
				<p key={ site.siteId }>{ site.name }</p>
			) ) }
		</div>
	),
} ) );

describe( 'UserSites', () => {
	const { useSelector } = jest.requireMock( 'calypso/state' );
	const defaultUser: UserProfileData = {
		ID: 123,
		user_login: 'test_user',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
	};

	beforeEach( () => {
		jest.clearAllMocks();
		useSelector.mockReturnValue( null );
	} );

	test( 'should render Spinner when fetching sites', () => {
		jest
			.mocked( useUserSitesQuery )
			.mockReturnValue( { isLoading: true } as ReturnType< typeof useUserSitesQuery > );

		render( <UserSites user={ defaultUser } /> );

		expect( screen.getByText( 'Loading sites' ) ).toBeVisible();
	} );

	test( 'should render error message when fetch fails', () => {
		jest.mocked( useUserSitesQuery ).mockReturnValue( {
			error: { message: 'Network error' },
		} as ReturnType< typeof useUserSitesQuery > );

		render( <UserSites user={ defaultUser } /> );

		expect( screen.getByText( 'Sorry, something went wrong.' ) ).toBeVisible();
	} );

	test( 'should render EmptyContent when no sites available', () => {
		jest.mocked( useUserSitesQuery ).mockReturnValue( {
			data: { sites: [], total: 0, primary_site_id: 0 } as UserSitesResponse,
		} as ReturnType< typeof useUserSitesQuery > );

		render( <UserSites user={ defaultUser } /> );

		expect( screen.getByText( 'No sites have been created yet.' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Create your first site' } )
		).not.toBeInTheDocument();
	} );

	test( 'should show "Create your first site" button when viewing own empty profile', () => {
		useSelector.mockReturnValue( { username: 'test_user' } );

		jest.mocked( useUserSitesQuery ).mockReturnValue( {
			data: { sites: [], total: 0, primary_site_id: 0 } as UserSitesResponse,
		} as ReturnType< typeof useUserSitesQuery > );

		render( <UserSites user={ defaultUser } /> );

		const createSiteButton = screen.getByRole( 'link', { name: 'Create your first site' } );
		expect( createSiteButton ).toBeVisible();
		expect( createSiteButton ).toHaveAttribute(
			'href',
			'/start?source=reader&ref=user-profile-page'
		);
	} );

	test( 'should render sites list when sites are available', () => {
		const mockSites: Pick< UserSitesResponse, 'sites' >[ 'sites' ] = [
			{
				ID: 1,
				name: 'Test Site 1',
				description: 'A test site',
				feed_ID: 101,
				URL: 'https://test1.wordpress.com',
				icon: { img: 'https://example.com/icon1.png' },
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
			{
				ID: 2,
				name: 'Test Site 2',
				description: 'Another test site',
				feed_ID: 102,
				URL: 'https://test2.wordpress.com',
				icon: { ico: 'https://example.com/icon2.ico' },
				is_following: true,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 200,
			},
		];

		jest.mocked( useUserSitesQuery ).mockReturnValue( {
			data: { sites: mockSites, total: 2, primary_site_id: 1 } as UserSitesResponse,
		} as ReturnType< typeof useUserSitesQuery > );

		render( <UserSites user={ defaultUser } /> );

		const sitesList = screen.getByTestId( 'reader-sites-list' );
		expect( sitesList ).toBeVisible();
		expect( screen.getByText( 'Test Site 1' ) ).toBeVisible();
		expect( screen.getByText( 'Test Site 2' ) ).toBeVisible();
	} );
} );
