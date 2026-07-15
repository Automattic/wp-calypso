/**
 * @jest-environment jsdom
 */
import { UserResponse } from '@automattic/api-core';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserAvatar, { UserAvatarInfo } from '../index';

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

let capturedOnUserLoaded: ( ( user: UserResponse | null ) => void ) | undefined;

jest.mock( 'calypso/blocks/user-avatar/user-hovercard', () => ( {
	__esModule: true,
	default: ( { onUserLoaded }: { onUserLoaded?: ( user: UserResponse | null ) => void } ) => {
		capturedOnUserLoaded = onUserLoaded;
		return <div data-testid="user-hovercard" />;
	},
} ) );

jest.mock( '@wordpress/components', () => ( {
	...jest.requireActual( '@wordpress/components' ),
	Popover: ( props: Record< string, unknown > ) => (
		<div data-testid="popover" data-placement={ props.placement }>
			{ props.children as React.ReactNode }
		</div>
	),
} ) );

describe( 'UserAvatar', () => {
	const defaultUser: UserAvatarInfo = {
		avatar_URL: 'https://gravatar.com/avatar/abc123',
		display_name: 'Test User',
		wpcom_login: 'testuser',
		wpcom_id: 123,
	};

	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	test( 'renders avatar image when avatar_URL is provided', () => {
		render( <UserAvatar user={ defaultUser } size={ 48 } /> );

		const img = document.querySelector( '.user-avatar__image' );
		expect( img ).toBeVisible();
		expect( img ).toHaveAttribute( 'width', '48' );
		expect( img ).toHaveAttribute( 'height', '48' );
	} );

	test( 'renders default avatar icon when avatar_URL is not provided', () => {
		render( <UserAvatar user={ { ...defaultUser, avatar_URL: undefined } } /> );

		const svg = document.querySelector( '.user-avatar svg' );
		expect( svg ).toBeVisible();
		expect( document.querySelector( '.user-avatar__image' ) ).not.toBeInTheDocument();
	} );

	test( 'renders default avatar when user is null', () => {
		render( <UserAvatar user={ null } /> );

		expect( document.querySelector( '.user-avatar__image' ) ).not.toBeInTheDocument();
		expect( document.querySelector( '.user-avatar svg' ) ).toBeVisible();
	} );

	test( 'uses default size of 32', () => {
		render( <UserAvatar user={ defaultUser } /> );

		const img = document.querySelector( '.user-avatar__image' );
		expect( img ).toHaveAttribute( 'width', '32' );
		expect( img ).toHaveAttribute( 'height', '32' );
	} );

	test( 'wraps avatar in profile link when wpcom_login is provided', () => {
		render( <UserAvatar user={ defaultUser } /> );

		const link = document.querySelector( '.user-avatar a' );
		expect( link ).toHaveAttribute( 'href', '/reader/users/testuser' );
	} );

	test( 'does not wrap avatar in link when wpcom_login is not provided', () => {
		render( <UserAvatar user={ { ...defaultUser, wpcom_login: undefined } } /> );

		expect( document.querySelector( '.user-avatar a' ) ).not.toBeInTheDocument();
	} );

	test( 'does not make the container focusable when there is no link wrapper', () => {
		render( <UserAvatar user={ { ...defaultUser, wpcom_login: undefined } } /> );

		const container = document.querySelector( '.user-avatar' );
		expect( container ).not.toHaveAttribute( 'tabindex' );
		expect( container ).not.toHaveAttribute( 'role' );
	} );

	test( 'does not show hovercard on keyboard focus', () => {
		render( <UserAvatar user={ defaultUser } /> );

		const link = document.querySelector( '.user-avatar a' ) as HTMLElement;
		act( () => link.focus() );
		act( () => jest.advanceTimersByTime( 200 ) );

		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();
	} );

	test( 'does not add tabIndex when avatar has a link wrapper', () => {
		render( <UserAvatar user={ defaultUser } /> );

		const container = document.querySelector( '.user-avatar' );
		expect( container ).not.toHaveAttribute( 'tabindex' );
		expect( container ).not.toHaveAttribute( 'role' );
	} );

	test( 'does not show hovercard when hideHovercard is true', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		render( <UserAvatar user={ defaultUser } hideHovercard /> );

		await user.hover( document.querySelector( '.user-avatar' )! );
		act( () => jest.advanceTimersByTime( 200 ) );

		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();
	} );

	test( 'does not show hovercard when user is null', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		render( <UserAvatar user={ null } /> );

		await user.hover( document.querySelector( '.user-avatar' )! );
		act( () => jest.advanceTimersByTime( 200 ) );

		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();
	} );

	test( 'shows hovercard after hover delay', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		render( <UserAvatar user={ defaultUser } /> );
		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();

		await user.hover( document.querySelector( '.user-avatar' )! );

		// Should not appear immediately.
		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();

		// Should appear after the delay.
		act( () => jest.advanceTimersByTime( 200 ) );
		expect( screen.getByTestId( 'user-hovercard' ) ).toBeInTheDocument();
	} );

	test( 'hides hovercard on mouse leave', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		render( <UserAvatar user={ defaultUser } /> );

		await user.hover( document.querySelector( '.user-avatar' )! );
		act( () => jest.advanceTimersByTime( 200 ) );
		expect( screen.getByTestId( 'user-hovercard' ) ).toBeInTheDocument();

		await user.unhover( document.querySelector( '.user-avatar' )! );
		act( () => jest.advanceTimersByTime( 100 ) );
		expect( screen.queryByTestId( 'user-hovercard' ) ).not.toBeInTheDocument();
	} );

	describe( 'dynamic hovercard placement', () => {
		const userWithBlog: UserResponse = {
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
		};

		function mockAvatarPosition( top: number, bottom: number, left: number, right: number ) {
			jest.spyOn( HTMLElement.prototype, 'getBoundingClientRect' ).mockReturnValue( {
				top,
				bottom,
				left,
				right,
				width: right - left,
				height: bottom - top,
				x: left,
				y: top,
				toJSON: jest.fn(),
			} );
		}

		async function showHovercardAndTriggerPlacement( userData: UserResponse | null ) {
			const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
			render( <UserAvatar user={ defaultUser } /> );

			await user.hover( document.querySelector( '.user-avatar' )! );
			act( () => jest.advanceTimersByTime( 200 ) );

			// Trigger the onUserLoaded callback from the hovercard mock.
			act( () => capturedOnUserLoaded?.( userData ) );
		}

		afterEach( () => {
			jest.restoreAllMocks();
		} );

		test( 'places hovercard at bottom-start when there is enough space below', async () => {
			// Avatar near the top of a tall viewport.
			Object.defineProperty( window, 'innerHeight', { value: 1000, configurable: true } );
			mockAvatarPosition( 50, 82, 100, 132 );

			await showHovercardAndTriggerPlacement( userWithBlog );

			expect( screen.getByTestId( 'popover' ) ).toHaveAttribute( 'data-placement', 'bottom-start' );
		} );

		test( 'places hovercard at top-start when not enough space below but enough above', async () => {
			// Avatar near the bottom of the viewport.
			Object.defineProperty( window, 'innerHeight', { value: 500, configurable: true } );
			mockAvatarPosition( 460, 492, 100, 132 );

			await showHovercardAndTriggerPlacement( userWithBlog );

			expect( screen.getByTestId( 'popover' ) ).toHaveAttribute( 'data-placement', 'top-start' );
		} );

		test( 'places hovercard to the right when not enough space above or below', async () => {
			// Avatar centered vertically in a short viewport, more space to the right.
			Object.defineProperty( window, 'innerHeight', { value: 400, configurable: true } );
			Object.defineProperty( window, 'innerWidth', { value: 1000, configurable: true } );
			mockAvatarPosition( 200, 232, 100, 132 );

			await showHovercardAndTriggerPlacement( userWithBlog );

			expect( screen.getByTestId( 'popover' ) ).toHaveAttribute( 'data-placement', 'right' );
		} );

		test( 'places hovercard to the left when more space on the left side', async () => {
			// Avatar centered vertically in a short viewport, more space to the left.
			Object.defineProperty( window, 'innerHeight', { value: 400, configurable: true } );
			Object.defineProperty( window, 'innerWidth', { value: 1000, configurable: true } );
			mockAvatarPosition( 200, 232, 800, 832 );

			await showHovercardAndTriggerPlacement( userWithBlog );

			expect( screen.getByTestId( 'popover' ) ).toHaveAttribute( 'data-placement', 'left' );
		} );
	} );
} );
