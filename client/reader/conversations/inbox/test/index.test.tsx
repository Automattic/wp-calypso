/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { show: jest.fn(), replace: jest.fn() },
} ) );

let mockIsNarrow = false;

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: jest.fn( () => mockIsNarrow ),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( 'calypso/reader/stream/use-selected-post-commands', () => ( {
	useSelectedPostCommands: () => ( { toggleSelectedLike: jest.fn() } ),
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn( () => ( { type: 'READER_TRACKS_EVENT_TEST' } ) ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( () => ( { type: 'NOTICE_TEST' } ) ),
} ) );

jest.mock( '../conversation-list', () => ( {
	ConversationList: ( props: {
		items: { key: string }[];
		unreadCount: number;
		selectedKey?: string;
		onSelect: ( item: { key: string }, source: string ) => void;
		onTabChange: ( tab: string ) => void;
		onSortChange: ( sort: string ) => void;
		onSearchChange: ( search: string ) => void;
		markAllCount: number;
		onMarkAllRead: () => void;
		onDensityChange: ( density: string ) => void;
	} ) => (
		<div>
			<p>Selected: { props.selectedKey ?? 'none' }</p>
			{ props.markAllCount > 0 && (
				<button onClick={ props.onMarkAllRead }>Mark { props.markAllCount } as read</button>
			) }
			{ props.items.map( ( item ) => (
				<button key={ item.key } onClick={ () => props.onSelect( item, 'click' ) }>
					{ item.key }
				</button>
			) ) }
			<button onClick={ () => props.onTabChange( 'yours' ) }>Your comments</button>
			<button onClick={ () => props.onTabChange( 'unread' ) }>Unread</button>
			<button onClick={ () => props.onSortChange( 'most_active' ) }>Most active</button>
			<button onClick={ () => props.onSearchChange( 'cats' ) }>Search</button>
			<button onClick={ () => props.onDensityChange( 'compact' ) }>Compact</button>
		</div>
	),
} ) );

jest.mock( '../conversation-detail', () => ( {
	ConversationDetail: ( props: {
		siteId: number;
		postId: number;
		onPrevious?: () => void;
		onNext?: () => void;
		startingCommentId?: number;
		highlightedCommentIds?: number[];
	} ) => (
		<div>
			<p>Detail: { `${ props.siteId }-${ props.postId }` }</p>
			<p>Start: { props.startingCommentId ?? 'latest' }</p>
			<p>New: { props.highlightedCommentIds?.join( ',' ) || 'none' }</p>
			<button disabled={ ! props.onPrevious } onClick={ props.onPrevious }>
				previous
			</button>
			<button disabled={ ! props.onNext } onClick={ props.onNext }>
				next
			</button>
		</div>
	),
} ) );

import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationsInbox } from '..';
import { makeConversation, makeOwnComment } from '../test/helpers';

const BASE = 'https://public-api.wordpress.com';

const unread = [
	makeConversation( { postId: 100, commentId: 1001, unreadNoteIds: [ 1 ] } ),
	makeConversation( { postId: 200, commentId: 2001, unreadNoteIds: [ 2 ] } ),
];
const conversations = [ ...unread, makeConversation( { postId: 300, commentId: 3001 } ) ];

const notes = [
	{ id: 1, meta: { ids: { site: 10, post: 100, comment: 1001 } } },
	{ id: 2, meta: { ids: { site: 10, post: 200, comment: 2001 } } },
	{ id: 3, read: 0, meta: { ids: { site: 10, post: 400, comment: 41 } } },
];

const conversationsPage = ( items = conversations, nextCursor: string | null = null ) => ( {
	conversations: items,
	next_cursor: nextCursor,
	unread_total: items.filter( ( { unread_note_ids } ) => unread_note_ids.length ).length,
} );

let requests: string[];
let replyConversations: ( uri: string ) => object;
let markReadStatus: number;
let markReadBodies: { counts: Record< string, number > }[];
let notesReady: Promise< void >;

const renderInbox = ( props: { siteId?: string; postId?: string } = {} ) =>
	renderWithProvider( <ConversationsInbox { ...props } />, {
		queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
	} );

// The list loads asynchronously, so wait for a row before acting on it.
const findRow = ( key: string ) => screen.findByRole( 'button', { name: key } );

beforeEach( () => {
	mockIsNarrow = false;
	jest.mocked( page.show ).mockReset();
	jest.mocked( page.replace ).mockReset();
	jest.mocked( recordReaderTracksEvent ).mockClear();
	requests = [];
	replyConversations = () => conversationsPage();
	markReadStatus = 200;
	markReadBodies = [];
	notesReady = Promise.resolve();
	nock( BASE )
		.persist()
		.get( '/wpcom/v2/read/conversations' )
		.query( true )
		.reply( 200, ( uri ) => {
			requests.push( uri );
			return replyConversations( uri );
		} )
		.get( '/wpcom/v2/read/conversations/comments' )
		.query( true )
		.reply( 200, ( uri ) => {
			requests.push( uri );
			return {
				comments: [
					makeOwnComment( { postId: 300, commentId: 31 } ),
					makeOwnComment( { postId: 300, commentId: 32 } ),
					makeOwnComment( { postId: 400, commentId: 41 } ),
				],
				next_cursor: null,
			};
		} )
		.get( '/rest/v1.1/notifications/' )
		.query( true )
		.reply( ( _uri, _body, callback ) => {
			notesReady.then( () => callback( null, [ 200, { notes } ] ) );
		} )
		.post( /\/notifications\/read/ )
		.reply( ( _uri, body ) => {
			markReadBodies.push( body as ( typeof markReadBodies )[ number ] );
			return [ markReadStatus, {} ];
		} );
} );

afterEach( () => nock.cleanAll() );

const markedNoteIds = () =>
	markReadBodies.map( ( { counts } ) => Object.keys( counts ).map( Number ) );

describe( 'ConversationsInbox', () => {
	it( 'auto-selects the first conversation when the URL has none', async () => {
		renderInbox();

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/100' )
		);
	} );

	it( 'selects the conversation from the URL without replacing it', async () => {
		renderInbox( { siteId: '10', postId: '200' } );

		await findRow( '10-p-200' );
		expect( screen.getByText( 'Selected: 10-p-200' ) ).toBeVisible();
		expect( screen.getByText( 'Detail: 10-200' ) ).toBeVisible();
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'marks a conversation as read and navigates to it when opened from the list', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await user.click( await findRow( '10-p-200' ) );

		await waitFor( () => expect( markedNoteIds() ).toEqual( [ [ 2 ] ] ) );
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/200' );
	} );

	it( 'does not mark an already-read conversation as read when opened', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await user.click( await findRow( '10-p-300' ) );

		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/300' );
		expect( markedNoteIds() ).toEqual( [] );
	} );

	it( 'shows an error notice when marking as read fails', async () => {
		const user = userEvent.setup();
		markReadStatus = 500;
		renderInbox( { siteId: '10', postId: '100' } );

		await user.click( await findRow( '10-p-200' ) );

		await waitFor( () =>
			expect( errorNotice ).toHaveBeenCalledWith(
				'Couldn’t mark as read. Try again.',
				expect.anything()
			)
		);
	} );

	it( 'disables the previous button at the start of the list', async () => {
		renderInbox( { siteId: '10', postId: '100' } );

		await findRow( '10-p-100' );
		expect( screen.getByRole( 'button', { name: 'previous' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'next' } ) ).toBeEnabled();
	} );

	it( 'disables the next button at the end of the list', async () => {
		renderInbox( { siteId: '10', postId: '300' } );

		await findRow( '10-p-300' );
		expect( screen.getByRole( 'button', { name: 'previous' } ) ).toBeEnabled();
		expect( screen.getByRole( 'button', { name: 'next' } ) ).toBeDisabled();
	} );

	it( 'opens the previous conversation and marks it as read', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '200' } );

		await findRow( '10-p-200' );
		await user.click( screen.getByRole( 'button', { name: 'previous' } ) );

		await waitFor( () => expect( markedNoteIds() ).toEqual( [ [ 1 ] ] ) );
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/100' );
	} );

	it( 'keeps the new comments of an opened conversation after it is marked read', async () => {
		const user = userEvent.setup();
		const { rerender } = renderInbox( { siteId: '10', postId: '100' } );

		await screen.findByText( 'New: 1001' );
		replyConversations = () =>
			conversationsPage( conversations.map( ( item ) => ( { ...item, unread_note_ids: [] } ) ) );
		await user.click( screen.getByRole( 'button', { name: '10-p-200' } ) );
		rerender( <ConversationsInbox siteId="10" postId="200" /> );

		expect( screen.getByText( 'New: 2001' ) ).toBeVisible();

		rerender( <ConversationsInbox siteId="10" postId="100" /> );
		rerender( <ConversationsInbox siteId="10" postId="200" /> );

		expect( screen.getByText( 'New: none' ) ).toBeVisible();
	} );

	it( 'highlights the new comments of a conversation opened before the notes loaded', async () => {
		const user = userEvent.setup();
		let releaseNotes = () => {};
		notesReady = new Promise( ( resolve ) => {
			releaseNotes = resolve;
		} );
		const { rerender } = renderInbox( { siteId: '10', postId: '100' } );

		await user.click( await findRow( '10-p-200' ) );
		rerender( <ConversationsInbox siteId="10" postId="200" /> );
		expect( screen.getByText( 'New: none' ) ).toBeVisible();

		releaseNotes();

		expect( await screen.findByText( 'New: 2001' ) ).toBeVisible();
	} );

	it( 'shows only unread conversations on the Unread tab', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await findRow( '10-p-300' );
		await user.click( screen.getByRole( 'button', { name: 'Unread' } ) );

		expect( screen.getByRole( 'button', { name: '10-p-200' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: '10-p-300' } ) ).not.toBeInTheDocument();
	} );

	it( 'sends the sort and search to the route', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await findRow( '10-p-100' );
		expect( requests[ 0 ] ).toContain( 'sort=newest' );

		await user.click( screen.getByRole( 'button', { name: 'Most active' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Search' } ) );

		await waitFor( () =>
			expect( requests ).toContainEqual( expect.stringMatching( /sort=most_active.*search=cats/ ) )
		);
	} );

	it( 'keeps loading when a page comes back empty with a cursor', async () => {
		replyConversations = ( uri ) =>
			uri.includes( 'cursor=next' )
				? conversationsPage( [ conversations[ 2 ] ] )
				: conversationsPage( [], 'next' );
		renderInbox( { siteId: '10', postId: '300' } );

		expect( await findRow( '10-p-300' ) ).toBeVisible();
	} );

	it( 'marks a comment read on a post the list has not loaded', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await findRow( '10-p-100' );
		await user.click( screen.getByRole( 'button', { name: 'Your comments' } ) );
		await user.click( await findRow( '10-p-400-c-41' ) );

		await waitFor( () => expect( markedNoteIds() ).toEqual( [ [ 3 ] ] ) );
	} );

	it( 'lists your comments and opens one at that comment', async () => {
		const user = userEvent.setup();
		const { rerender } = renderInbox( { siteId: '10', postId: '100' } );

		await findRow( '10-p-100' );
		await user.click( screen.getByRole( 'button', { name: 'Your comments' } ) );
		await user.click( await findRow( '10-p-300-c-32' ) );

		expect( screen.getByRole( 'button', { name: '10-p-300-c-31' } ) ).toBeVisible();
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/300' );

		rerender( <ConversationsInbox siteId="10" postId="300" /> );

		expect( screen.getByText( 'Selected: 10-p-300-c-32' ) ).toBeVisible();
		expect( screen.getByText( 'Start: 32' ) ).toBeVisible();
	} );

	describe( 'on narrow screens', () => {
		beforeEach( () => {
			mockIsNarrow = true;
		} );

		it( 'switches to a single pane before the detail pane gets cramped', () => {
			renderInbox();

			expect( useBreakpoint ).toHaveBeenCalledWith( '<1180px' );
		} );

		it( 'shows only the list and does not pick a conversation when the URL has none', async () => {
			renderInbox();

			await findRow( '10-p-100' );
			expect( screen.queryByText( /^Detail:/ ) ).not.toBeInTheDocument();
			expect( page.replace ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Tracks', () => {
		const tracked = ( name: string ) =>
			jest
				.mocked( recordReaderTracksEvent )
				.mock.calls.filter( ( [ eventName ] ) => eventName === name )
				.map( ( [ , properties ] ) => properties );

		it( 'records one view per visit, not per conversation', () => {
			const { rerender } = renderInbox( { siteId: '10', postId: '100' } );
			rerender( <ConversationsInbox siteId="10" postId="200" /> );

			expect( tracked( 'calypso_reader_conversations_inbox_viewed' ) ).toHaveLength( 1 );
		} );

		it( 'marks the open conversation as read without recording another open', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await user.click( await findRow( '10-p-100' ) );

			await waitFor( () => expect( markedNoteIds() ).toEqual( [ [ 1 ] ] ) );
			expect( page.show ).not.toHaveBeenCalled();
			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [] );
		} );

		it( 'does not record an open for the conversation picked automatically', async () => {
			renderInbox();

			await waitFor( () => expect( page.replace ).toHaveBeenCalled() );
			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [] );
		} );

		it( 'records a conversation opened from the list', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await user.click( await findRow( '10-p-200' ) );

			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [
				{ source: 'click', unread_count: 1 },
			] );
		} );

		it( 'records a conversation opened with the next button', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '200' } );

			await findRow( '10-p-200' );
			await user.click( screen.getByRole( 'button', { name: 'next' } ) );

			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [
				{ source: 'button', unread_count: 0 },
			] );
		} );

		it( 'records a conversation opened with a shortcut', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await findRow( '10-p-100' );
			await user.keyboard( 'j' );

			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [
				{ source: 'shortcut', unread_count: 1 },
			] );
		} );

		it( 'marks every loaded unread note as read in one call and records the count', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await findRow( '10-p-100' );
			await user.click( screen.getByRole( 'button', { name: 'Mark 2 as read' } ) );

			await waitFor( () => expect( markedNoteIds() ).toEqual( [ [ 1, 2 ] ] ) );
			expect( tracked( 'calypso_reader_conversations_inbox_marked_all_read' ) ).toEqual( [
				{ count: 2 },
			] );
		} );

		it( 'records the tab picked and how', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await user.click( screen.getByRole( 'button', { name: 'Your comments' } ) );
			await user.keyboard( 'u' );
			await user.keyboard( 'c' );

			expect( tracked( 'calypso_reader_conversations_inbox_tab_selected' ) ).toEqual( [
				{ tab: 'yours', source: 'click' },
				{ tab: 'unread', source: 'shortcut' },
				{ tab: 'yours', source: 'shortcut' },
			] );
		} );

		it( 'saves and records the density picked', async () => {
			const user = userEvent.setup();
			const scope = nock( BASE )
				.post( '/rest/v1.1/me/preferences', {
					calypso_preferences: { reader_conversations_inbox_density: 'compact' },
				} )
				.reply( 200, { calypso_preferences: {} } );
			renderInbox( { siteId: '10', postId: '100' } );

			await user.click( screen.getByRole( 'button', { name: 'Compact' } ) );

			expect( tracked( 'calypso_reader_conversations_inbox_density_changed' ) ).toEqual( [
				{ density: 'compact' },
			] );
			await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		} );

		it( 'does not record picking the tab that is already open', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await user.keyboard( 'a' );

			expect( tracked( 'calypso_reader_conversations_inbox_tab_selected' ) ).toEqual( [] );
		} );
	} );
} );
