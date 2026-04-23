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

jest.mock( '../use-achievements-visibility' );

jest.mock( '../achievements-grid', () => ( {
	__esModule: true,
	default: () => <div data-testid="achievements-grid" />,
} ) );

jest.mock( '../achievements-settings', () => ( {
	__esModule: true,
	default: () => <button data-testid="achievements-settings">Settings</button>,
} ) );

const mockIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useAchievementsVisibility } = require( '../use-achievements-visibility' ) as {
	useAchievementsVisibility: jest.Mock;
};

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
		mockIsEnabled.mockReturnValue( true );
	} );

	test( 'should render nothing when feature flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );
		useAchievementsVisibility.mockReturnValue( { isOwnProfile: true, isVisible: true } );

		const { container } = render( <UserAchievements user={ defaultUser } /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render nothing when achievements are not visible', () => {
		useAchievementsVisibility.mockReturnValue( { isOwnProfile: false, isVisible: false } );

		const { container } = render( <UserAchievements user={ defaultUser } /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render achievements grid when visible', () => {
		useAchievementsVisibility.mockReturnValue( { isOwnProfile: true, isVisible: true } );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-grid' ) ).toBeVisible();
	} );

	test( 'should show settings button on own profile', () => {
		useAchievementsVisibility.mockReturnValue( { isOwnProfile: true, isVisible: true } );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-settings' ) ).toBeVisible();
	} );

	test( 'should not show settings button on other user profile', () => {
		useAchievementsVisibility.mockReturnValue( { isOwnProfile: false, isVisible: true } );

		render( <UserAchievements user={ defaultUser } /> );

		expect( screen.getByTestId( 'achievements-grid' ) ).toBeVisible();
		expect( screen.queryByTestId( 'achievements-settings' ) ).not.toBeInTheDocument();
	} );
} );
