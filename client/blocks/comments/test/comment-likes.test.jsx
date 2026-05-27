/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN } from 'calypso/state/reader-ui/action-types';
import CommentLikeButtonContainer from '../comment-likes';

jest.mock( 'calypso/reader/components/icons/like-icon', () => () => <span /> );

const renderWithRedux = ( element, { state, onAction = () => {} } = {} ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const reducer = (
		currentState = state ?? {
			currentUser: { id: 1 },
			comments: { items: { '100-1': [] } },
		},
		action
	) => {
		onAction( action );
		return currentState;
	};

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ createStore( reducer ) }>{ element }</Provider>
		</QueryClientProvider>
	);
};

describe( 'CommentLikeButtonContainer', () => {
	it( 'renders like data from the comment prop', () => {
		renderWithRedux(
			<CommentLikeButtonContainer
				siteId={ 100 }
				postId={ 1 }
				commentId={ 5 }
				comment={ { ID: 5, i_like: true, like_count: 7 } }
				tagName="button"
				onLikeToggle={ jest.fn() }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Liked' } ) ).toHaveClass( 'is-liked' );
		expect( screen.getByText( '7' ) ).toBeVisible();
	} );

	it( 'accepts string comment ids', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		renderWithRedux(
			<CommentLikeButtonContainer
				siteId={ 100 }
				postId={ 1 }
				commentId="placeholder-5"
				comment={ { ID: 'placeholder-5', i_like: false, like_count: 0 } }
				tagName="button"
				onLikeToggle={ jest.fn() }
			/>
		);

		expect( consoleError ).not.toHaveBeenCalled();
		consoleError.mockRestore();
	} );

	it( 'does not persist unsupported comment unlike actions for logged-out users', async () => {
		const actions = [];

		renderWithRedux(
			<CommentLikeButtonContainer
				siteId={ 100 }
				postId={ 1 }
				commentId={ 5 }
				comment={ { ID: 5, i_like: true, like_count: 7 } }
				tagName="button"
				onLikeToggle={ jest.fn() }
			/>,
			{
				state: {
					currentUser: { id: null },
					comments: { items: { '100-1': [] } },
				},
				onAction: ( action ) => actions.push( action ),
			}
		);

		screen.getByRole( 'button', { name: 'Liked' } ).click();

		expect( actions ).not.toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					type: READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
					lastAction: expect.objectContaining( { type: 'comment-unlike' } ),
				} ),
			] )
		);
	} );
} );
