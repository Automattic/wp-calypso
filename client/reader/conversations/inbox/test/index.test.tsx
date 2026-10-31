/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { show: jest.fn(), replace: jest.fn() },
} ) );

let mockIsNarrow = false;

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: () => mockIsNarrow,
} ) );

jest.mock( 'calypso/reader/data/notifications', () => ( {
	useCommentNotes: jest.fn(),
	useMarkNotesRead: jest.fn(),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn( () => ( { type: 'READER_TRACKS_EVENT_TEST' } ) ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( () => ( { type: 'NOTICE_TEST' } ) ),
} ) );

jest.mock( '../conversation-list', () => ( {
	ConversationList: ( props: {
		conversations: { key: string }[];
		selectedKey?: string;
		onSelect: ( conversation: { key: string }, source: string ) => void;
		onTabChange: ( tab: string ) => void;
		onMarkAllRead: () => void;
		onDensityChange: ( density: string ) => void;
	} ) => (
		<div>
			<p>Selected: { props.selectedKey ?? 'none' }</p>
			<button onClick={ props.onMarkAllRead }>Mark all as read</button>
			{ props.conversations.map( ( conversation ) => (
				<button key={ conversation.key } onClick={ () => props.onSelect( conversation, 'click' ) }>
					{ conversation.key }
				</button>
			) ) }
			<button onClick={ () => props.onTabChange( 'yours' ) }>Your comments</button>
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
		highlightedCommentIds?: number[];
	} ) => (
		<div>
			<p>Detail: { `${ props.siteId }-${ props.postId }` }</p>
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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useCommentNotes, useMarkNotesRead } from 'calypso/reader/data/notifications';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationsInbox } from '..';
import { makeNote } from '../test/helpers';

const mockedUseCommentNotes = jest.mocked( useCommentNotes );
const mockedUseMarkNotesRead = jest.mocked( useMarkNotesRead );

const notes = [
	makeNote( {
		id: 1,
		postId: 100,
		commentId: 1001,
		timestamp: '2024-01-03T00:00:00Z',
		read: 0,
	} ),
	makeNote( {
		id: 2,
		postId: 200,
		commentId: 2001,
		timestamp: '2024-01-02T00:00:00Z',
		read: 0,
	} ),
	makeNote( {
		id: 3,
		postId: 300,
		commentId: 3001,
		timestamp: '2024-01-01T00:00:00Z',
		read: 1,
	} ),
];

const renderInbox = ( props: { siteId?: string; postId?: string } = {} ) =>
	renderWithProvider( <ConversationsInbox { ...props } /> );

let markRead: jest.Mock;

beforeEach( () => {
	mockIsNarrow = false;
	jest.mocked( page.show ).mockReset();
	jest.mocked( page.replace ).mockReset();
	jest.mocked( recordReaderTracksEvent ).mockClear();
	markRead = jest.fn();
	mockedUseCommentNotes.mockReturnValue( { data: notes, isLoading: false } as never );
	mockedUseMarkNotesRead.mockReturnValue( { mutate: markRead } as never );
} );

describe( 'ConversationsInbox', () => {
	it( 'auto-selects the first conversation when the URL has none', async () => {
		renderInbox();

		await waitFor( () =>
			expect( page.replace ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/100' )
		);
	} );

	it( 'selects the conversation from the URL without replacing it', () => {
		renderInbox( { siteId: '10', postId: '200' } );

		expect( screen.getByText( 'Selected: 10-200' ) ).toBeVisible();
		expect( screen.getByText( 'Detail: 10-200' ) ).toBeVisible();
		expect( page.replace ).not.toHaveBeenCalled();
	} );

	it( 'marks a conversation as read and navigates to it when opened from the list', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await user.click( screen.getByRole( 'button', { name: '10-200' } ) );

		expect( markRead ).toHaveBeenCalledWith( [ 2 ], expect.anything() );
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/200' );
	} );

	it( 'does not mark an already-read conversation as read when opened', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await user.click( screen.getByRole( 'button', { name: '10-300' } ) );

		expect( markRead ).not.toHaveBeenCalled();
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/300' );
	} );

	it( 'shows an error notice when marking as read fails', async () => {
		const user = userEvent.setup();
		markRead.mockImplementation( ( _ids, options ) => options.onError() );
		renderInbox( { siteId: '10', postId: '100' } );

		await user.click( screen.getByRole( 'button', { name: '10-200' } ) );

		expect( errorNotice ).toHaveBeenCalledWith( 'Couldn’t mark as read. Try again.' );
	} );

	it( 'disables the previous button at the start of the list', () => {
		renderInbox( { siteId: '10', postId: '100' } );

		expect( screen.getByRole( 'button', { name: 'previous' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'next' } ) ).toBeEnabled();
	} );

	it( 'disables the next button at the end of the list', () => {
		renderInbox( { siteId: '10', postId: '300' } );

		expect( screen.getByRole( 'button', { name: 'previous' } ) ).toBeEnabled();
		expect( screen.getByRole( 'button', { name: 'next' } ) ).toBeDisabled();
	} );

	it( 'opens the previous conversation and marks it as read', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '200' } );

		await user.click( screen.getByRole( 'button', { name: 'previous' } ) );

		expect( markRead ).toHaveBeenCalledWith( [ 1 ], expect.anything() );
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/100' );
	} );

	it( 'opens the next conversation without marking it as read when it has no unread notes', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '200' } );

		await user.click( screen.getByRole( 'button', { name: 'next' } ) );

		expect( markRead ).not.toHaveBeenCalled();
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/300' );
	} );

	it( 'keeps the new comments of an opened conversation after it is marked read', async () => {
		const user = userEvent.setup();
		const { rerender } = renderInbox( { siteId: '10', postId: '100' } );

		await user.click( screen.getByRole( 'button', { name: '10-200' } ) );
		mockedUseCommentNotes.mockReturnValue( {
			data: notes.map( ( note ) => ( { ...note, read: 1 } ) ),
			isLoading: false,
		} as never );
		rerender( <ConversationsInbox siteId="10" postId="200" /> );

		expect( screen.getByText( 'New: 2001' ) ).toBeVisible();

		rerender( <ConversationsInbox siteId="10" postId="100" /> );
		rerender( <ConversationsInbox siteId="10" postId="200" /> );

		expect( screen.getByText( 'New: none' ) ).toBeVisible();
	} );

	describe( 'on narrow screens', () => {
		beforeEach( () => {
			mockIsNarrow = true;
		} );

		it( 'shows only the list and does not pick a conversation when the URL has none', () => {
			renderInbox();

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

			await user.click( screen.getByRole( 'button', { name: '10-100' } ) );

			expect( markRead ).toHaveBeenCalledWith( [ 1 ], expect.anything() );
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

			await user.click( screen.getByRole( 'button', { name: '10-200' } ) );

			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [
				{ source: 'click', unread_count: 1 },
			] );
		} );

		it( 'records a conversation opened with the next button', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '200' } );

			await user.click( screen.getByRole( 'button', { name: 'next' } ) );

			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [
				{ source: 'button', unread_count: 0 },
			] );
		} );

		it( 'records a conversation opened with a shortcut', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await user.keyboard( 'j' );

			expect( tracked( 'calypso_reader_conversations_inbox_conversation_opened' ) ).toEqual( [
				{ source: 'shortcut', unread_count: 1 },
			] );
		} );

		it( 'marks every unread note as read in one call and records the count', async () => {
			const user = userEvent.setup();
			renderInbox( { siteId: '10', postId: '100' } );

			await user.click( screen.getByRole( 'button', { name: 'Mark all as read' } ) );

			expect( markRead ).toHaveBeenCalledTimes( 1 );
			expect( markRead ).toHaveBeenCalledWith( [ 1, 2 ] );
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
			const scope = nock( 'https://public-api.wordpress.com' )
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
