/**
 * @jest-environment jsdom
 */
import { UserResponse } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { UserAvatarInfo } from '../../index';
import UserHovercard from '../index';
import { useGravatarProfileV3Query } from '../queries/use-gravatar-profile-v3-query';

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

jest.mock( '../queries/use-gravatar-profile-v3-query', () => ( {
	useGravatarProfileV3Query: jest.fn(),
} ) );

jest.mock( 'calypso/reader/follow-button', () => ( {
	__esModule: true,
	default: jest.fn( () => <button data-testid="follow-button">Follow</button> ),
} ) );

jest.mock( '../recommended-blogs', () => ( {
	__esModule: true,
	default: ( { userLogin }: { userLogin: string } ) => (
		<div data-testid="recommended-blogs" data-user-login={ userLogin } />
	),
} ) );

const mockUseQuery = jest.mocked( useQuery );
const mockUseGravatarProfileV3Query = jest.mocked( useGravatarProfileV3Query );

const defaultUserProp: UserAvatarInfo = {
	wpcom_id: 123,
	wpcom_login: 'testuser',
	avatar_URL: 'https://gravatar.com/avatar/abc123',
	display_name: 'Test User',
};

const wpcomUserResponse: UserResponse = {
	ID: 123,
	user_login: 'testuser',
	display_name: 'Test User',
	first_name: '',
	last_name: '',
	nice_name: 'testuser',
	description: '',
	avatar_URL: 'https://gravatar.com/avatar/abc123',
	profile_URL: '',
	primary_blog: {
		ID: 100,
		feed_ID: 200,
		URL: 'https://testblog.com',
		title: 'Test Blog',
		description: 'A test blog',
		avatar_URL: null,
	},
	recommended_blogs_count: 5,
};

function setupMocks( {
	gravatarLoading = false,
	gravatarData,
	wpcomLoading = false,
	wpcomData,
}: {
	gravatarLoading?: boolean;
	gravatarData?: UserResponse;
	wpcomLoading?: boolean;
	wpcomData?: UserResponse;
} ) {
	mockUseGravatarProfileV3Query.mockReturnValue( {
		isLoading: gravatarLoading,
		data: gravatarData,
	} as ReturnType< typeof useGravatarProfileV3Query > );

	mockUseQuery.mockReturnValue( {
		isLoading: wpcomLoading,
		data: wpcomData,
	} as ReturnType< typeof useQuery > );
}

function renderUserHovercard(
	props?: Partial< { user: UserAvatarInfo; onUserLoaded: ( user: UserResponse | null ) => void } >
) {
	renderWithProvider(
		<UserHovercard user={ defaultUserProp } onUserLoaded={ jest.fn() } { ...props } />
	);
}

describe( 'UserHovercard', () => {
	beforeAll( () => {
		window.IntersectionObserver = jest.fn().mockReturnValue( {
			observe: () => null,
			unobserve: () => null,
			disconnect: () => null,
		} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders spinner when wpcom data is loading', () => {
		setupMocks( { wpcomLoading: true } );

		renderUserHovercard();

		expect( document.querySelector( '.wp-spinner-wrapper' ) ).toBeVisible();
	} );

	test( 'renders spinner when gravatar data is loading', () => {
		setupMocks( { gravatarLoading: true } );

		renderUserHovercard();

		expect( document.querySelector( '.wp-spinner-wrapper' ) ).toBeVisible();
	} );

	test( 'renders user not found when no user data is available', () => {
		setupMocks( {} );

		renderUserHovercard();

		const notFound = document.querySelector( '.user-hovercard--not-found' );
		expect( notFound ).toBeVisible();
		expect( notFound ).toHaveTextContent( 'User not found.' );
	} );

	test( 'renders user hovercard header when wpcom data is available', () => {
		setupMocks( { wpcomData: wpcomUserResponse } );

		renderUserHovercard();

		expect( document.querySelector( '.user-hovercard__header' ) ).toBeVisible();
	} );

	test( 'falls back to gravatar user when wpcom data has no user_login', () => {
		const gravatarUser: UserResponse = {
			ID: 0,
			user_login: 'gravataruser',
			display_name: 'Gravatar User',
			first_name: '',
			last_name: '',
			nice_name: 'gravataruser',
			description: '',
			avatar_URL: 'https://gravatar.com/avatar/def456',
			profile_URL: '',
			primary_blog: null,
		};

		setupMocks( {
			gravatarData: gravatarUser,
			wpcomData: { ...wpcomUserResponse, user_login: '' },
		} );

		renderUserHovercard();

		expect( document.querySelector( '.user-hovercard__header' ) ).toHaveTextContent(
			'Gravatar User'
		);
	} );

	test( 'renders primary blog card when wpcom user has primary_blog', () => {
		setupMocks( { wpcomData: wpcomUserResponse } );

		renderUserHovercard();

		expect( document.querySelector( '.user-hovercard__primary-blog' ) ).toBeVisible();
	} );

	test( 'does not render primary blog card when wpcom user has no primary_blog', () => {
		setupMocks( { wpcomData: { ...wpcomUserResponse, primary_blog: null } } );

		renderUserHovercard();

		expect( document.querySelector( '.user-hovercard__primary-blog' ) ).not.toBeInTheDocument();
	} );

	test( 'renders recommended blogs when wpcom user has recommended_blogs_count', () => {
		setupMocks( { wpcomData: wpcomUserResponse } );

		renderUserHovercard();

		const recommendedBlogs = screen.getByTestId( 'recommended-blogs' );
		expect( recommendedBlogs ).toBeVisible();
		expect( recommendedBlogs ).toHaveAttribute( 'data-user-login', 'testuser' );
	} );

	test( 'does not render recommended blogs when recommended_blogs_count is 0', () => {
		setupMocks( { wpcomData: { ...wpcomUserResponse, recommended_blogs_count: 0 } } );

		renderUserHovercard();

		expect( screen.queryByTestId( 'recommended-blogs' ) ).not.toBeInTheDocument();
	} );

	test( 'does not call onUserLoaded while still loading', () => {
		const onUserLoaded = jest.fn();
		setupMocks( { wpcomLoading: true } );

		renderUserHovercard( { onUserLoaded } );

		expect( onUserLoaded ).not.toHaveBeenCalled();
	} );

	test( 'calls onUserLoaded with null when no user data is found', () => {
		const onUserLoaded = jest.fn();
		setupMocks( {} );

		renderUserHovercard( { onUserLoaded } );

		expect( onUserLoaded ).toHaveBeenCalledWith( null );
	} );

	test( 'calls onUserLoaded with user data when loading completes', () => {
		const onUserLoaded = jest.fn();
		setupMocks( { wpcomData: wpcomUserResponse } );

		renderUserHovercard( { onUserLoaded } );

		expect( onUserLoaded ).toHaveBeenCalledWith( wpcomUserResponse );
	} );
} );
