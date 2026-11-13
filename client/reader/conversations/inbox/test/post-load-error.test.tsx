/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/components/data/document-head', () => () => null );

import { readerPostQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import readerContentWidth from 'calypso/reader/lib/content-width';
import preferences from 'calypso/state/preferences/reducer';
import userSuggestions from 'calypso/state/user-suggestions/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationsInbox } from '..';
import { makeConversation } from './helpers';

const BASE = 'https://public-api.wordpress.com';
const postKey = { blogId: 10, postId: 100 };
const queryKey = readerPostQuery( postKey, readerContentWidth() ).queryKey;
const scrollIntoView = Element.prototype.scrollIntoView;

beforeAll( () => {
	Element.prototype.scrollIntoView = jest.fn();
	nock.disableNetConnect();
} );

afterAll( () => {
	Element.prototype.scrollIntoView = scrollIntoView;
	nock.enableNetConnect();
} );

describe.each( [ 'list details', 'no list details', 'absent from list' ] )( '%s', ( variant ) => {
	describe.each( [ 403, 404, 500 ] )( 'HTTP %i', ( status ) => {
		it( 'keeps the inbox mounted after the selected post request exhausts retries', async () => {
			const queryClient = new QueryClient( {
				defaultOptions: { queries: { retry: 3, retryDelay: 0 } },
			} );
			const conversation = makeConversation();
			if ( variant === 'list details' ) {
				conversation.post.excerpt = '<p>A list post excerpt</p>';
				conversation.post.discussion = {
					comment_count: 1,
					comments_open: true,
					comment_status: 'open',
					pings_open: false,
					ping_status: 'closed',
				};
			}
			const comments = [
				{
					ID: 1001,
					post: { ID: 100 },
					content: '<p>A comment that stays visible</p>',
					date: '2026-01-01T00:00:00Z',
					parent: false,
					status: 'approved',
					author: { ID: 7, name: 'Ana', avatar_URL: 'https://example.com/ana.png' },
				},
			];
			nock( BASE )
				.persist()
				.get( '/wpcom/v2/read/conversations' )
				.query( true )
				.reply( 200, {
					conversations: variant === 'absent from list' ? [] : [ conversation ],
					next_cursor: null,
					unread_total: 0,
				} )
				.get( '/wpcom/v2/read/conversations/comments' )
				.query( true )
				.reply( 200, { comments: [], next_cursor: null } )
				.get( '/rest/v1.1/notifications/' )
				.query( true )
				.reply( 200, { notes: [] } )
				.get( '/rest/v1.1/sites/10/posts/100/replies' )
				.query( true )
				.reply( 200, { comments, found: 1 } );
			const postRequest = nock( BASE )
				.get( '/rest/v1.1/read/sites/10/posts/100' )
				.query( true )
				.times( 4 )
				.reply( status, { error: 'post_unavailable', message: 'Post unavailable' } );
			let firstException: unknown;
			const captureException = ( event: ErrorEvent ) => {
				firstException ??= event.error ?? event.message;
			};
			window.addEventListener( 'error', captureException );
			const consoleError = jest.spyOn( console, 'error' );
			let unmount: ( () => void ) | undefined;
			try {
				const view = renderWithProvider( <ConversationsInbox siteId="10" postId="100" />, {
					queryClient,
					reducers: { preferences, userSuggestions },
					initialState: {
						currentUser: {
							id: 42,
							user: { primary_blog: 10 },
							capabilities: { 10: {} },
						},
						sites: { items: { 10: { ID: 10 } } },
					},
				} );
				unmount = view.unmount;
				await waitFor( () => {
					expect( postRequest.isDone() ).toBe( true );
					expect( queryClient.getQueryState( queryKey ) ).toMatchObject( {
						status: 'error',
						fetchStatus: 'idle',
						fetchFailureCount: 4,
					} );
				} );
				view.rerender( <ConversationsInbox siteId="10" postId="100" /> );
				await act( async () => {
					await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
				} );

				expect( screen.getByRole( 'tab', { name: 'All' } ) ).toBeVisible();
				const hasListDetails = variant === 'list details';
				expect(
					await screen.findByText(
						hasListDetails ? 'A list post excerpt' : 'This post can’t be loaded.'
					)
				).toBeVisible();
				await waitFor( () =>
					expect( screen.queryAllByText( 'A comment that stays visible' ) ).toHaveLength(
						hasListDetails ? 1 : 0
					)
				);
				for ( const comment of screen.queryAllByText( 'A comment that stays visible' ) ) {
					expect( comment ).toBeVisible();
				}
				expect( screen.queryAllByRole( 'heading', { name: 'A post title' } ) ).toHaveLength(
					hasListDetails ? 1 : 0
				);
				expect( screen.queryAllByText( 'This post can’t be loaded.' ) ).toHaveLength(
					hasListDetails ? 0 : 1
				);
				expect(
					screen.queryByRole( 'link', { name: /Open it on the site/ } )?.getAttribute( 'href' )
				).toBe( variant === 'no list details' ? conversation.post.url : undefined );
				expect( screen.queryByRole( 'button', { name: /Repost/ } ) ).not.toBeInTheDocument();
				expect( firstException ).toBeUndefined();
				expect( consoleError ).not.toHaveBeenCalled();
			} catch ( error ) {
				throw firstException ?? error;
			} finally {
				unmount?.();
				await queryClient.cancelQueries();
				queryClient.clear();
				nock.cleanAll();
				window.removeEventListener( 'error', captureException );
				consoleError.mockRestore();
			}
		} );
	} );
} );
