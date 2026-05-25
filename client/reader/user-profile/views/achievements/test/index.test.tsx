/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
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

jest.mock( '../achievements-privacy-notice', () => ( {
	__esModule: true,
	default: () => <div data-testid="achievements-privacy-notice" />,
} ) );

const mockActivityStreakProps = jest.fn();
jest.mock( '../activity-streak', () => ( {
	__esModule: true,
	ActivityStreak: ( props: { streak?: { current_streak: number }; isOwnProfile: boolean } ) => {
		mockActivityStreakProps( props );
		return <div data-testid="activity-streak" />;
	},
} ) );

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
		mockActivityStreakProps.mockClear();
		useAchievementsQuery.mockReturnValue( {
			lockedAchievements: [],
			isLoading: false,
		} );
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

	test( 'renders ActivityStreak with the engagement streak slice', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: true,
			isVisible: true,
			isLoading: false,
		} );
		useAchievementsQuery.mockReturnValue( {
			lockedAchievements: [],
			engagementStreak: {
				current_streak: 7,
				longest_streak: 12,
				freezes_available: 1,
				freeze_used_date: null,
				next_freeze_in_days: 0,
			},
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		expect( mockActivityStreakProps ).toHaveBeenCalledWith(
			expect.objectContaining( {
				streak: expect.objectContaining( { current_streak: 7 } ),
				isOwnProfile: true,
			} )
		);
	} );

	test( 'still mounts ActivityStreak when engagement streak is undefined (component self-handles)', () => {
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );
		useAchievementsQuery.mockReturnValue( {
			lockedAchievements: [],
			engagementStreak: undefined,
			isLoading: false,
		} );

		render( <UserAchievements user={ defaultUser } /> );

		// ActivityStreak is mounted; it returns null internally when streak is undefined.
		expect( mockActivityStreakProps ).toHaveBeenCalledWith(
			expect.objectContaining( { streak: undefined, isOwnProfile: false } )
		);
	} );
} );
