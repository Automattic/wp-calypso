/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import PostCardComments from '../post-card-comments';

const post = {
	ID: 1,
	site_ID: 100,
	URL: 'https://example.com/post',
	discussion: {
		comment_count: 3,
		comments_open: true,
	},
};

const renderPostCardComments = ( props = {}, state = {} ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore(
		(
			currentState = {
				currentUser: {
					id: 1,
					user: { avatar_URL: 'https://example.com/avatar.jpg', username: 'reader' },
					capabilities: { 100: {} },
				},
				comments: {
					items: { '100-1': [] },
					fetchStatus: {},
					errors: {},
					activeReplies: {},
					inlineExpansion: {},
				},
				userSuggestions: { items: {} },
				route: { path: { current: '/read', previous: '/read' } },
				...state,
			}
		) => currentState,
		applyMiddleware( thunkMiddleware )
	);

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<PostCardComments post={ post } { ...props } />
			</Provider>
		</QueryClientProvider>
	);
};

describe( 'PostCardComments', () => {
	it( 'renders the comments UI before comments have been fetched into Redux', () => {
		renderPostCardComments();

		expect( screen.getByPlaceholderText( 'Add a comment…' ) ).toBeVisible();
	} );

	it( 'renders the closed message when comments are closed but existing comments are counted', () => {
		renderPostCardComments( {
			post: {
				...post,
				discussion: {
					comment_count: 3,
					comments_open: false,
				},
			},
		} );

		expect( screen.getByText( 'Comments closed.' ) ).toBeVisible();
	} );

	it( 'does not render comments when comments are closed and there are no comments', () => {
		const { container } = renderPostCardComments( {
			post: {
				...post,
				discussion: {
					comment_count: 0,
					comments_open: false,
				},
			},
		} );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
