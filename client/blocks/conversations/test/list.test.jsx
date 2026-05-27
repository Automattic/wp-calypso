/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ConversationCommentList from '../list';

const BASE = 'https://public-api.wordpress.com';

jest.mock( 'calypso/blocks/comments/form-root', () => ( { activeReplyCommentId } ) => (
	<li data-testid="comment-form-root" data-active-reply={ activeReplyCommentId ?? '' } />
) );
jest.mock(
	'calypso/blocks/comments/post-comment',
	() =>
		( { activeReplyCommentId, commentId, commentsToShow, onReplyClick } ) => (
			<li
				data-testid={ `post-comment-${ commentId }` }
				data-active-reply={ String( activeReplyCommentId === commentId ) }
				data-display-type={ commentsToShow?.[ commentId ] ?? '' }
			>
				<button type="button" onClick={ () => onReplyClick( commentId ) }>
					Reply { commentId }
				</button>
			</li>
		)
);
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: () => ( { type: 'TRACK_READER_EVENT' } ),
} ) );

const post = {
	ID: 1,
	site_ID: 100,
	discussion: {
		comment_count: 2,
	},
};

const comment = ( overrides ) => ( {
	ID: 1,
	content: '',
	date: '2026-05-01T00:00:00.000Z',
	parent: false,
	status: 'approved',
	type: 'comment',
	...overrides,
} );

const comments = ( amount ) =>
	Array.from( { length: amount }, ( _, index ) =>
		comment( {
			ID: index + 1,
			content: `Comment ${ index + 1 }`,
			date: new Date( Date.UTC( 2026, 4, index + 1 ) ).toISOString(),
		} )
	);

const renderList = ( props = {}, options = {} ) => {
	const queryClient =
		options.queryClient ?? new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore( ( state = { currentUser: { id: 123 } } ) => state );
	const { post: renderedPost = post, ...listProps } = props;

	const result = render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>
				<ConversationCommentList
					post={ renderedPost }
					commentIds={ [ 1, 2 ] }
					filterParents={ false }
					{ ...listProps }
				/>
			</Provider>
		</QueryClientProvider>
	);

	return { ...result, queryClient, store };
};

describe( 'ConversationCommentList', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'renders comments from the comments API without Redux comments state', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 2,
						content: 'Second',
						date: '2026-05-02T00:00:00.000Z',
						parent: false,
						status: 'approved',
						type: 'comment',
					},
					{
						ID: 1,
						content: 'First',
						date: '2026-05-01T00:00:00.000Z',
						parent: false,
						status: 'approved',
						type: 'comment',
					},
				],
				found: 2,
			} );

		renderList();

		await waitFor( () => {
			expect( screen.getByTestId( 'post-comment-1' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'post-comment-2' ) ).toBeInTheDocument();
		} );
	} );

	it( 'marks each seeded conversation comment as visible when filtering parents', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					comment( { ID: 2, date: '2026-05-02T00:00:00.000Z' } ),
					comment( { ID: 1, date: '2026-05-01T00:00:00.000Z' } ),
				],
				found: 2,
			} );

		renderList( { filterParents: true } );

		await waitFor( () => {
			expect( screen.getByTestId( 'post-comment-1' ) ).toHaveAttribute(
				'data-display-type',
				'is-excerpt'
			);
			expect( screen.getByTestId( 'post-comment-2' ) ).toHaveAttribute(
				'data-display-type',
				'is-excerpt'
			);
		} );
	} );

	it( 'requests earlier comments with the before page when the loaded page is incomplete', async () => {
		const firstPageComments = comments( 50 );
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: firstPageComments,
				found: 51,
			} );
		const earlierRequest = nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
				before: firstPageComments[ 0 ].date,
			} )
			.reply( 200, {
				comments: [ comment( { ID: 51, date: '2026-04-01T00:00:00.000Z' } ) ],
				found: 51,
			} );

		renderList( { commentIds: [ 1 ] } );

		await waitFor( () => expect( earlierRequest.isDone() ).toBe( true ) );
	} );

	it( 'does not request the earlier page again while that page is already loading', async () => {
		const firstPageComments = comments( 50 );
		let earlierRequestCount = 0;
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: firstPageComments,
				found: 51,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
				before: firstPageComments[ 0 ].date,
			} )
			.times( 2 )
			.delay( 200 )
			.reply( () => {
				earlierRequestCount++;
				return [
					200,
					{
						comments: [ comment( { ID: 51, date: '2026-04-01T00:00:00.000Z' } ) ],
						found: 51,
					},
				];
			} );

		const { queryClient, rerender, store } = renderList( { commentIds: [ 1 ] } );

		await waitFor( () => expect( earlierRequestCount ).toBe( 1 ) );
		rerender(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<ConversationCommentList post={ post } commentIds={ [ 1 ] } filterParents={ false } />
				</Provider>
			</QueryClientProvider>
		);
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );

		expect( earlierRequestCount ).toBe( 1 );
	} );

	it( 'requests later comments with the after page when only newer comments are available', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [ comment( { ID: 1, date: '2026-05-01T00:00:00.000Z' } ) ],
				found: 2,
			} );
		const laterRequest = nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'ASC',
				author_wpcom_data: 'true',
				force: 'wpcom',
				after: '2026-05-01T00:00:00.000Z',
				offset: '1',
			} )
			.reply( 200, {
				comments: [ comment( { ID: 2, date: '2026-05-02T00:00:00.000Z' } ) ],
				found: 2,
			} );

		renderList( { commentIds: [ 1 ] } );

		await waitFor( () => expect( laterRequest.isDone() ).toBe( true ) );
	} );

	it( 'keeps the active reply local to the current post', async () => {
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( true )
			.reply( 200, {
				comments: [ comment( { ID: 1 } ) ],
				found: 1,
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/2/replies' )
			.query( true )
			.reply( 200, {
				comments: [ comment( { ID: 2 } ) ],
				found: 1,
			} );

		const { queryClient, rerender, store } = renderList( { commentIds: [ 1 ] } );
		await waitFor( () => expect( screen.getByTestId( 'post-comment-1' ) ).toBeInTheDocument() );

		await userEvent.click( screen.getByRole( 'button', { name: 'Reply 1' } ) );
		expect( screen.getByTestId( 'comment-form-root' ) ).toHaveAttribute( 'data-active-reply', '1' );

		rerender(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<ConversationCommentList
						post={ { ...post, ID: 2 } }
						commentIds={ [ 2 ] }
						filterParents={ false }
					/>
				</Provider>
			</QueryClientProvider>
		);

		await waitFor( () => expect( screen.getByTestId( 'post-comment-2' ) ).toBeInTheDocument() );
		expect( screen.getByTestId( 'comment-form-root' ) ).toHaveAttribute( 'data-active-reply', '' );
	} );

	it( 'loads missing parent comments through comment queries', async () => {
		const parentRequest = nock( BASE )
			.get( '/rest/v1.1/sites/100/comments/1' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				ID: 1,
				content: 'Parent',
				date: '2026-05-01T00:00:00.000Z',
				parent: false,
				status: 'approved',
				type: 'comment',
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 2,
						content: 'Reply',
						date: '2026-05-02T00:00:00.000Z',
						parent: { ID: 1 },
						status: 'approved',
						type: 'comment',
					},
				],
				found: 2,
			} );

		renderList( { commentIds: [ 2 ] } );

		await waitFor( () => {
			expect( screen.getByTestId( 'post-comment-1' ) ).toBeInTheDocument();
			expect( parentRequest.isDone() ).toBe( true );
		} );
	} );

	it( 'does not repeatedly request a missing parent comment after the parent request fails', async () => {
		let parentRequestCount = 0;
		nock( BASE )
			.get( '/rest/v1.1/sites/100/comments/1' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.times( 2 )
			.reply( () => {
				parentRequestCount++;
				return [ 404, { error: 'unknown_comment' } ];
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 2,
						content: 'Reply',
						date: '2026-05-02T00:00:00.000Z',
						parent: { ID: 1 },
						status: 'approved',
						type: 'comment',
					},
				],
				found: 2,
			} );

		renderList( { commentIds: [ 2 ] } );

		await waitFor( () => expect( parentRequestCount ).toBe( 1 ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );

		expect( parentRequestCount ).toBe( 1 );
	} );

	it( 'does not retry failed missing parent requests with a default query client', async () => {
		let parentRequestCount = 0;
		nock( BASE )
			.get( '/rest/v1.1/sites/100/comments/1' )
			.query( {
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.times( 2 )
			.reply( () => {
				parentRequestCount++;
				return [ 404, { error: 'unknown_comment' } ];
			} );
		nock( BASE )
			.get( '/rest/v1.1/sites/100/posts/1/replies' )
			.query( {
				number: '50',
				status: 'approved',
				order: 'DESC',
				author_wpcom_data: 'true',
				force: 'wpcom',
			} )
			.reply( 200, {
				comments: [
					{
						ID: 2,
						content: 'Reply',
						date: '2026-05-02T00:00:00.000Z',
						parent: { ID: 1 },
						status: 'approved',
						type: 'comment',
					},
				],
				found: 2,
			} );

		renderList( { commentIds: [ 2 ] }, { queryClient: new QueryClient() } );

		await waitFor( () => expect( parentRequestCount ).toBe( 1 ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 1200 ) );

		expect( parentRequestCount ).toBe( 1 );
	} );
} );
