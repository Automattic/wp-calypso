/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import PostComment from '../post-comment';

jest.mock( '../comment-actions', () => () => null );
jest.mock( '../form', () => () => null );

const makeComment = ( ID, name, parent = false ) => ( {
	ID,
	parent,
	author: { name, URL: '' },
	content: `<p>Comment from ${ name }</p>`,
	date: '2024-01-01T00:00:00Z',
	status: 'approved',
	URL: `https://example.com/post#comment-${ ID }`,
} );

const commentsTree = {
	1: { data: makeComment( 1, 'Ana' ), children: [ 2 ] },
	2: { data: makeComment( 2, 'Bruno', { ID: 1 } ), children: [ 3 ] },
	3: { data: makeComment( 3, 'Carla', { ID: 2 } ), children: [] },
	children: [ 1 ],
};

const renderComment = ( props = {} ) => {
	const store = createStore( ( state = { currentUser: { id: 1 } } ) => state );

	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<ol>
					<PostComment
						post={ { ID: 100, site_ID: 10 } }
						commentsTree={ commentsTree }
						commentId={ 1 }
						depth={ 0 }
						maxDepth={ 2 }
						{ ...props }
					/>
				</ol>
			</Provider>
		</QueryClientProvider>
	);
};

describe( 'PostComment', () => {
	it( 'renders no new labels or collapse toggle by default', () => {
		renderComment();

		expect( screen.getByText( 'Comment from Bruno' ) ).toBeVisible();
		expect( screen.queryByText( 'New' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Hide replies' } ) ).not.toBeInTheDocument();
	} );

	it( 'labels the highlighted comments as new', () => {
		renderComment( { highlightedCommentIds: [ 2 ] } );

		expect( screen.getAllByText( 'New' ) ).toHaveLength( 1 );
		expect(
			screen.getByText( 'Comment from Bruno' ).closest( '.comments__comment' )
		).toHaveTextContent( 'New' );
	} );

	it( 'collapses and expands the replies of a top-level comment', async () => {
		const user = userEvent.setup();
		renderComment( { collapsibleThreads: true } );

		const hide = screen.getByRole( 'button', { name: 'Hide replies' } );
		expect( hide ).toHaveAttribute( 'aria-expanded', 'true' );
		expect( screen.getAllByRole( 'button', { name: /replies/ } ) ).toHaveLength( 1 );

		await user.click( hide );

		expect( screen.queryByText( 'Comment from Bruno' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '2 replies' ) ).toBeVisible();

		const show = screen.getByRole( 'button', { name: 'Show replies' } );
		expect( show ).toHaveAttribute( 'aria-expanded', 'false' );

		await user.click( show );

		expect( screen.getByText( 'Comment from Bruno' ) ).toBeVisible();
		expect( screen.queryByText( '2 replies' ) ).not.toBeInTheDocument();
	} );
} );
