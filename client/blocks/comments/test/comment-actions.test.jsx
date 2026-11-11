/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CommentActions from '../comment-actions';
import { CommentLabelsContext } from '../comment-labels-context';

const renderCommentActions = ( props = {}, { spellOutLabels = false } = {} ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore(
		(
			state = {
				currentUser: { id: 1 },
				sites: { items: {} },
			}
		) => state
	);

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<CommentLabelsContext.Provider value={ spellOutLabels }>
					<CommentActions
						post={ {
							ID: 456,
							site_ID: 123,
							discussion: { comments_open: true },
							sharing_enabled: false,
						} }
						comment={ { ID: 789, i_like: false, isPlaceholder: false, like_count: 0 } }
						activeReplyCommentId={ 789 }
						handleReply={ jest.fn() }
						onLikeToggle={ jest.fn() }
						onReplyCancel={ jest.fn() }
						{ ...props }
					/>
				</CommentLabelsContext.Provider>
			</Provider>
		</QueryClientProvider>
	);
};

describe( 'CommentActions', () => {
	it( 'uses the comment id from the comment object', () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		renderCommentActions();

		expect( screen.getByRole( 'button', { name: 'Cancel reply' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Like' } ) ).toBeVisible();
		expect( consoleError ).not.toHaveBeenCalled();

		consoleError.mockRestore();
	} );

	it( 'renders the comment like count from the comment object', () => {
		renderCommentActions( {
			comment: { ID: 789, i_like: true, isPlaceholder: false, like_count: 7 },
		} );

		expect( screen.getByRole( 'button', { name: 'Liked' } ) ).toHaveClass( 'is-liked' );
		expect( screen.getByText( '7' ) ).toBeVisible();
	} );

	it( 'puts Cancel in place of Reply when labels are spelled out', async () => {
		const user = userEvent.setup();
		const onReplyCancel = jest.fn();

		renderCommentActions( { onReplyCancel }, { spellOutLabels: true } );

		expect( screen.queryByRole( 'button', { name: 'Reply' } ) ).not.toBeInTheDocument();
		expect( screen.getAllByRole( 'button', { name: 'Cancel reply' } ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'button', { name: 'Cancel reply' } ) ).toHaveTextContent(
			/^Cancel$/
		);

		await user.click( screen.getByRole( 'button', { name: 'Cancel reply' } ) );

		expect( onReplyCancel ).toHaveBeenCalledTimes( 1 );
	} );
} );
