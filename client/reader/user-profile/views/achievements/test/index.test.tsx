/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import UserAchievements from '../index';
import type { ReaderUser } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

jest.mock( 'calypso/reader/components/achievements/use-achievements-visibility' );

jest.mock( 'calypso/data/reader/use-achievements-query' );

const mockAchievementsGridProps = jest.fn();
jest.mock( '../achievements-grid', () => ( {
	__esModule: true,
	default: ( props: { userLogin: string; isOwnProfile: boolean } ) => {
		mockAchievementsGridProps( props );
		return <div data-testid="achievements-grid" />;
	},
} ) );

jest.mock( '../achievements-settings', () => ( {
	__esModule: true,
	default: () => <button data-testid="achievements-settings">Settings</button>,
} ) );

jest.mock( 'calypso/reader/components/achievements/years-of-service-badge', () => ( {
	YearsOfServiceBadge: ( { yearsOfService }: { yearsOfService: number } ) => (
		<div data-testid="years-of-service-badge">{ yearsOfService }</div>
	),
} ) );

const mockIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useAchievementsVisibility =
	require( 'calypso/reader/components/achievements/use-achievements-visibility' )
		.default as jest.Mock;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useAchievementsQuery = require( 'calypso/data/reader/use-achievements-query' )
	.useAchievementsQuery as jest.Mock;

describe( 'UserAchievements', () => {
	const defaultUser: ReaderUser = {
		ID: 123,
		user_login: 'test_user',
		nice_name: 'nice_name',
		first_name: 'First',
		last_name: 'Last',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		profile_URL: '',
		description: '',
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockAchievementsGridProps.mockClear();
		mockIsEnabled.mockReturnValue( true );
		useAchievementsQuery.mockReturnValue( {
			yearsOfService: undefined,
			lockedAchievements: [],
			isLoading: false,
		} );
	} );

	test( 'should render nothing when feature flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: true,
			isVisible: true,
			isLoading: false,
		} );

		const { container } = render( <UserAchievements user={ defaultUser } /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render nothing when achievements are not visible', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: false,
			isLoading: false,
		} );

		const { container } = render( <UserAchievements user={ defaultUser } /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render achievements grid when visible', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: true,
			isVisible: true,
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-grid' ) ).toBeVisible();
	} );

	test( 'should show settings button on own profile', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: true,
			isVisible: true,
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-settings' ) ).toBeVisible();
	} );

	test( 'should show spinner while loading visibility', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: false,
			isLoading: true,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByText( 'Loading…' ) ).toBeVisible();
		expect( screen.queryByTestId( 'achievements-grid' ) ).not.toBeInTheDocument();
	} );

	test( 'should not show settings button on other user profile', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-grid' ) ).toBeVisible();
		expect( screen.queryByTestId( 'achievements-settings' ) ).not.toBeInTheDocument();
	} );

	test( 'should render YearsOfServiceBadge when years_of_service > 0', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );
		useAchievementsQuery.mockReturnValue( { yearsOfService: 5, isLoading: false } );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'years-of-service-badge' ) ).toBeVisible();
		expect( screen.getByText( '5' ) ).toBeVisible();
	} );

	test( 'should not render YearsOfServiceBadge when years_of_service is 0', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );
		useAchievementsQuery.mockReturnValue( { yearsOfService: 0, isLoading: false } );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.queryByTestId( 'years-of-service-badge' ) ).not.toBeInTheDocument();
	} );

	test( 'should not render YearsOfServiceBadge when years_of_service is undefined', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );
		useAchievementsQuery.mockReturnValue( {
			yearsOfService: undefined,
			lockedAchievements: [],
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.queryByTestId( 'years-of-service-badge' ) ).not.toBeInTheDocument();
	} );

	test( 'forwards isOwnProfile=true to AchievementsGrid on own profile', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: true,
			isVisible: true,
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( mockAchievementsGridProps ).toHaveBeenCalledWith(
			expect.objectContaining( { userLogin: 'test_user', isOwnProfile: true } )
		);
	} );

	test( 'forwards isOwnProfile=false to AchievementsGrid on someone else’s profile', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( mockAchievementsGridProps ).toHaveBeenCalledWith(
			expect.objectContaining( { userLogin: 'test_user', isOwnProfile: false } )
		);
	} );
} );
