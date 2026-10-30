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
	it( 'labels highlighted comments as new and collapses replies', async () => {
		const user = userEvent.setup();
		renderComment( {
			highlightedCommentIds: [ 2 ],
			collapsibleThreads: true,
			maxChildrenToShow: 1,
		} );

		expect( screen.getAllByText( 'New' ) ).toHaveLength( 1 );
		expect( screen.getByText( 'Comment from Bruno' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Hide replies' } ) );

		expect( screen.queryByText( 'Comment from Bruno' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '2 replies' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Show replies' } ) ).toHaveAttribute(
			'aria-expanded',
			'false'
		);
	} );
} );
