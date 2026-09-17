/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import useAchievementsVisibility from 'calypso/reader/components/achievements/use-achievements-visibility';
import UserAchievements from '../index';
import type { ReaderUser } from '@automattic/api-core';

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

jest.mock( 'calypso/reader/user-profile/components/private-tab-notice', () => ( {
	__esModule: true,
	default: ( { title }: { title: string } ) => (
		<div data-testid="private-tab-notice">{ title }</div>
	),
} ) );
const mockActivityStreakProps = jest.fn();
jest.mock( '../activity-streak', () => ( {
	__esModule: true,
	ActivityStreak: ( props: { streak?: { current_streak: number }; isOwnProfile: boolean } ) => {
		mockActivityStreakProps( props );
		return <div data-testid="activity-streak" />;
	},
} ) );

const mockUseAchievementsVisibility = jest.mocked( useAchievementsVisibility );
const mockUseAchievementsQuery = jest.mocked( useAchievementsQuery );

const getAchievementsVisibility = (
	overrides: Partial< ReturnType< typeof useAchievementsVisibility > > = {}
): ReturnType< typeof useAchievementsVisibility > => ( {
	isOwnProfile: false,
	isPublic: false,
	isVisible: false,
	isLoading: false,
	...overrides,
} );

const getAchievementsQuery = (
	overrides: Partial< ReturnType< typeof useAchievementsQuery > > = {}
): ReturnType< typeof useAchievementsQuery > => ( {
	achievements: [],
	lockedAchievements: [],
	yearsOfService: undefined,
	engagementStreak: undefined,
	dailyPostStreaks: [],
	found: 0,
	isLoading: false,
	isError: false,
	hasNextPage: false,
	isFetchingNextPage: false,
	fetchNextPage: jest.fn(),
	...overrides,
} );

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
		mockActivityStreakProps.mockClear();
		mockUseAchievementsQuery.mockReturnValue(
			getAchievementsQuery( {
				lockedAchievements: [],
				isLoading: false,
			} )
		);
	} );

	test( 'should render nothing when achievements are not visible', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: false,
				isVisible: false,
				isLoading: false,
			} )
		);

		const { container } = render( <UserAchievements user={ defaultUser } /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render achievements grid when visible', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: true,
				isVisible: true,
				isLoading: false,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-grid' ) ).toBeVisible();
	} );

	test( 'should show settings button on own profile', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: true,
				isVisible: true,
				isLoading: false,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-settings' ) ).toBeVisible();
	} );

	test( 'should show spinner while loading visibility', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: false,
				isVisible: false,
				isLoading: true,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByText( 'Loading…' ) ).toBeVisible();
		expect( screen.queryByTestId( 'achievements-grid' ) ).not.toBeInTheDocument();
	} );

	test( 'should not show settings button on other user profile', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: false,
				isVisible: true,
				isLoading: false,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-grid' ) ).toBeVisible();
		expect( screen.queryByTestId( 'achievements-settings' ) ).not.toBeInTheDocument();
	} );

	test( 'forwards isOwnProfile=true to AchievementsGrid on own profile', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: true,
				isVisible: true,
				isLoading: false,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		expect( mockAchievementsGridProps ).toHaveBeenCalledWith(
			expect.objectContaining( { userLogin: 'test_user', isOwnProfile: true } )
		);
	} );

	test( 'forwards isOwnProfile=false to AchievementsGrid on someone else’s profile', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: false,
				isVisible: true,
				isLoading: false,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		expect( mockAchievementsGridProps ).toHaveBeenCalledWith(
			expect.objectContaining( { userLogin: 'test_user', isOwnProfile: false } )
		);
	} );

	test( 'renders ActivityStreak with the engagement streak slice', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: true,
				isVisible: true,
				isLoading: false,
			} )
		);
		mockUseAchievementsQuery.mockReturnValue(
			getAchievementsQuery( {
				lockedAchievements: [],
				engagementStreak: {
					current_streak: 7,
					longest_streak: 12,
					last_streak_date: '2026-06-18',
					freezes_available: 1,
					freeze_used_date: null,
					next_freeze_in_days: 0,
				},
				isLoading: false,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		expect( mockActivityStreakProps ).toHaveBeenCalledWith(
			expect.objectContaining( {
				streak: expect.objectContaining( { current_streak: 7 } ),
				isOwnProfile: true,
			} )
		);
	} );

	test( 'still mounts ActivityStreak when engagement streak is undefined (component self-handles)', () => {
		mockUseAchievementsVisibility.mockReturnValue(
			getAchievementsVisibility( {
				isOwnProfile: false,
				isVisible: true,
				isLoading: false,
			} )
		);
		mockUseAchievementsQuery.mockReturnValue(
			getAchievementsQuery( {
				lockedAchievements: [],
				engagementStreak: undefined,
				isLoading: false,
			} )
		);

		render( <UserAchievements user={ defaultUser } /> );

		// ActivityStreak is mounted; it returns null internally when streak is undefined.
		expect( mockActivityStreakProps ).toHaveBeenCalledWith(
			expect.objectContaining( { streak: undefined, isOwnProfile: false } )
		);
	} );
} );
