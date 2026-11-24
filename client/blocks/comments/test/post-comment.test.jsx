/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import PostComment from '../post-comment';

jest.mock( 'calypso/blocks/user-avatar', () => () => null );
jest.mock( '../comment-actions', () => () => null );
jest.mock( '../post-comment-content', () => ( { content } ) => <p>{ content }</p> );

const comment = ( ID, content, parent = false ) => ( {
	ID,
	content,
	parent: parent && { ID: parent },
	date: '2026-11-10T00:00:00.000Z',
	URL: `https://example.com/post/#comment-${ ID }`,
	author: { ID: ID * 10, name: `Author ${ ID }` },
	status: 'approved',
} );

const commentsTree = {
	1: { data: comment( 1, 'Top-level comment' ), children: [ 2 ] },
	2: { data: comment( 2, 'First reply', 1 ), children: [ 3 ] },
	3: { data: comment( 3, 'Nested reply', 2 ), children: [] },
};

const renderThread = () =>
	render(
		<Provider store={ createStore( ( state = { currentUser: { id: 1 } } ) => state ) }>
			<ul>
				<PostComment
					post={ { ID: 456, site_ID: 123, discussion: { comments_open: true } } }
					commentsTree={ commentsTree }
					commentId={ 1 }
					depth={ 0 }
					collapsibleThreads
				/>
			</ul>
		</Provider>
	);

describe( 'PostComment', () => {
	it( 'highlights a comment that just arrived, unless the reader wrote it', () => {
		const now = new Date().toISOString();
		const tree = {
			1: { data: { ...comment( 1, 'Their comment' ), date: now }, children: [] },
			2: { data: { ...comment( 2, 'My comment' ), date: now }, children: [] },
		};
		const store = createStore( ( state = { currentUser: { user: { ID: 20 } } } ) => state );
		render(
			<Provider store={ store }>
				<ul>
					{ [ 1, 2 ].map( ( id ) => (
						<PostComment
							key={ id }
							post={ { ID: 456, site_ID: 123, discussion: { comments_open: true } } }
							commentsTree={ tree }
							commentId={ id }
							depth={ 0 }
							shouldHighlightNew
						/>
					) ) }
				</ul>
			</Provider>
		);

		expect( screen.getByText( 'Their comment' ).closest( 'li' ) ).toHaveClass( 'is-highlighted' );
		expect( screen.getByText( 'My comment' ).closest( 'li' ) ).not.toHaveClass( 'is-highlighted' );
	} );

	it( 'counts the hidden replies next to the toggle while the thread is collapsed', async () => {
		const user = userEvent.setup();
		renderThread();

		expect( screen.getByText( 'First reply' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Hide replies' } ) ).toHaveAttribute(
			'aria-expanded',
			'true'
		);

		await user.click( screen.getByRole( 'button', { name: 'Hide replies' } ) );

		const toggle = screen.getByRole( 'button', { name: 'Show 2 replies' } );
		expect( toggle ).toHaveTextContent( /^2 replies$/ );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( screen.queryByText( 'First reply' ) ).not.toBeInTheDocument();

		await user.click( toggle );

		expect( screen.getByText( 'Nested reply' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Hide replies' } ) ).toHaveTextContent( /^$/ );
	} );
} );
