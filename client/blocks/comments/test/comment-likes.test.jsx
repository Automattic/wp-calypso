/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CommentLikeButtonContainer from '../comment-likes';

jest.mock( 'calypso/reader/components/icons/like-icon', () => () => <span /> );

const renderWithRedux = ( element ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const reducer = (
		state = {
			currentUser: { id: 1 },
			comments: { items: { '100-1': [] } },
		}
	) => state;

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
} );
