/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import posts from 'calypso/state/posts/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LikeButtonContainer from '../index';

const siteId = 100;
const postId = 200;

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( {
		queries: {
			retry: false,
		},
		mutations: {
			retry: false,
		},
	} );
	return instance;
};

const defaultProps = {
	siteId,
	postId,
	tagName: 'button',
};

const renderComponent = ( props = {}, { initialState = {}, ...options } = {} ) => {
	return renderWithProvider( <LikeButtonContainer { ...defaultProps } { ...props } />, {
		queryClient: getQueryClient(),
		reducers: { posts },
		initialState,
		...options,
	} );
};

const mockLikesApi = ( { found = 5, iLike = false } = {} ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteId }/posts/${ postId }/likes` )
		.reply( 200, { found, i_like: iLike, likes: [] } );
};

describe( 'LikeButtonContainer', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'renders the like count from the API', async () => {
		mockLikesApi( { found: 42 } );

		renderComponent();

		await waitFor( () => {
			expect( screen.getByText( '42' ) ).toBeVisible();
		} );
	} );

	it( 'calls like when a logged-in user clicks the button', async () => {
		mockLikesApi( { found: 5, iLike: false } );
		const onLikeToggle = jest.fn();

		// Mock the like API endpoint
		nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v1.1/sites/${ siteId }/posts/${ postId }/likes/new` )
			.reply( 200, { success: true, like_count: 6, liker: { ID: 1 } } );

		renderComponent( { onLikeToggle }, { initialState: { currentUser: { id: 1 } } } );

		await waitFor( () => {
			expect( screen.getByText( '5' ) ).toBeVisible();
		} );

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button' ) );

		await waitFor( () => {
			expect( onLikeToggle ).toHaveBeenCalledWith( true );
		} );
	} );

	it( 'calls unlike when a logged-in user clicks an already-liked button', async () => {
		mockLikesApi( { found: 5, iLike: true } );
		const onLikeToggle = jest.fn();

		// Mock the unlike API endpoint
		nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v1.1/sites/${ siteId }/posts/${ postId }/likes/mine/delete` )
			.reply( 200, { success: true, like_count: 4, liker: { ID: 1 } } );

		renderComponent( { onLikeToggle }, { initialState: { currentUser: { id: 1 } } } );

		await waitFor( () => {
			expect( screen.getByText( '5' ) ).toBeVisible();
		} );

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button' ) );

		await waitFor( () => {
			expect( onLikeToggle ).toHaveBeenCalledWith( false );
		} );
	} );

	it( 'registers a pending login action when a logged-out user clicks like', async () => {
		mockLikesApi( { found: 5, iLike: false } );
		const onLikeToggle = jest.fn();

		renderComponent( { onLikeToggle } );

		await waitFor( () => {
			expect( screen.getByText( '5' ) ).toBeVisible();
		} );

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button' ) );

		// onLikeToggle should NOT be called for logged-out users
		expect( onLikeToggle ).not.toHaveBeenCalled();
	} );
} );
