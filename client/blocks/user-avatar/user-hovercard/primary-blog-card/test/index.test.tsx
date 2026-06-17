/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { successNotice } from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PrimaryBlogCard from '../index';

jest.mock( 'calypso/state/notices/actions', () => ( {
	__esModule: true,
	successNotice: jest.fn( ( text: string, options: { duration: number } ) => ( {
		type: 'NOTICE/SUCCESS',
		text,
		options,
	} ) ),
} ) );

jest.mock( 'calypso/reader/follow-button', () => ( {
	__esModule: true,
	default: jest.fn( ( { className }: { className: string } ) => (
		<button data-testid="follow-button" className={ className }>
			Follow
		</button>
	) ),
} ) );

describe( 'PrimaryBlogCard', () => {
	const defaultUser: ComponentProps< typeof PrimaryBlogCard >[ 'user' ] = {
		ID: 1,
		user_login: 'testuser',
		display_name: 'Test User',
		first_name: 'Test',
		last_name: 'User',
		nice_name: 'testuser',
		description: 'A test user',
		avatar_URL: 'https://example.com/avatar.jpg',
		profile_URL: 'https://example.com/profile',
		primary_blog: {
			ID: 100,
			feed_ID: 200,
			URL: 'https://testblog.com',
			title: 'Test Blog',
			description: 'A blog about testing',
			avatar_URL: 'https://example.com/site-icon.jpg',
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'returns null when user has no primary blog', () => {
		const { container } = renderWithProvider(
			<PrimaryBlogCard user={ { ...defaultUser, primary_blog: null } } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders correct blog info', () => {
		renderWithProvider( <PrimaryBlogCard user={ defaultUser } /> );

		expect( screen.getByRole( 'heading', { level: 5 } ) ).toHaveTextContent( 'Test Blog' );
		expect( screen.getByText( 'A blog about testing' ) ).toBeVisible();
		expect( screen.getByText( /by Test User/ ) ).toBeVisible();
	} );

	test( 'falls back to first_name + last_name when display_name is empty', () => {
		const user = { ...defaultUser, display_name: '' };

		renderWithProvider( <PrimaryBlogCard user={ user } /> );

		expect( screen.getByText( /by Test User/ ) ).toBeVisible();
	} );

	test( 'falls back to nice_name when display_name and names are empty', () => {
		const user = { ...defaultUser, display_name: '', first_name: '', last_name: '' };

		renderWithProvider( <PrimaryBlogCard user={ user } /> );

		expect( screen.getByText( /by testuser/ ) ).toBeVisible();
	} );

	test( 'hides description when primary blog has no description', () => {
		const user = {
			...defaultUser,
			primary_blog: { ...defaultUser.primary_blog!, description: '' },
		};

		renderWithProvider( <PrimaryBlogCard user={ user } /> );

		expect( screen.queryByText( 'A blog about testing' ) ).not.toBeInTheDocument();
	} );

	test( 'links to feed URL when feed_ID is available', () => {
		renderWithProvider( <PrimaryBlogCard user={ defaultUser } /> );

		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', '/reader/feeds/200' );
	} );

	test( 'links to blog URL when feed_ID is not available', () => {
		const user = {
			...defaultUser,
			primary_blog: { ...defaultUser.primary_blog!, feed_ID: 0 },
		};

		renderWithProvider( <PrimaryBlogCard user={ user } /> );

		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', '/reader/blogs/100' );
	} );

	test( 'renders follow button with correct props', () => {
		renderWithProvider( <PrimaryBlogCard user={ defaultUser } /> );

		expect( screen.getByTestId( 'follow-button' ) ).toBeVisible();
		// Assert only on the props (first argument). React 18 calls function
		// components with a second argument (legacy context), React 19 does not,
		// so checking the call's first argument keeps this version-agnostic.
		expect( jest.mocked( ReaderFollowButton ).mock.lastCall?.[ 0 ] ).toEqual(
			expect.objectContaining( {
				siteUrl: 'https://testblog.com',
				feedId: 200,
				siteId: 100,
				iconSize: 24,
			} )
		);
	} );

	describe( 'onFollowToggle', () => {
		const mockedReaderFollowButton = jest.mocked( ReaderFollowButton );
		const mockedSuccessNotice = jest.mocked( successNotice );

		function fireOnFollowToggle( followed: boolean ) {
			return mockedReaderFollowButton.mock.calls[ 0 ][ 0 ].onFollowToggle?.( followed );
		}

		test( 'shows subscribed notice when followed', () => {
			renderWithProvider( <PrimaryBlogCard user={ defaultUser } /> );
			fireOnFollowToggle( true );

			expect( mockedSuccessNotice ).toHaveBeenCalledWith(
				expect.stringContaining( 'subscribed to' ),
				{ duration: 3000 }
			);
		} );

		test( 'shows unsubscribed notice when unfollowed', () => {
			renderWithProvider( <PrimaryBlogCard user={ defaultUser } /> );
			fireOnFollowToggle( false );

			expect( mockedSuccessNotice ).toHaveBeenCalledWith(
				expect.stringContaining( 'unsubscribed from' ),
				{ duration: 3000 }
			);
		} );

		test( 'falls back to URL when blog title is empty', () => {
			const user = {
				...defaultUser,
				primary_blog: { ...defaultUser.primary_blog!, title: '' },
			};

			renderWithProvider( <PrimaryBlogCard user={ user } /> );
			fireOnFollowToggle( true );

			expect( mockedSuccessNotice ).toHaveBeenCalledWith(
				expect.stringContaining( 'https://testblog.com' ),
				{ duration: 3000 }
			);
		} );
	} );
} );
