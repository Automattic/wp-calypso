/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { show: jest.fn(), replace: jest.fn() },
} ) );

jest.mock( 'calypso/reader/data/notifications', () => ( {
	useCommentNotes: jest.fn(),
	useMarkNotesRead: jest.fn(),
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '../conversation-list', () => ( {
	ConversationList: ( props: {
		conversations: { key: string }[];
		selectedKey?: string;
		onSelect: ( conversation: { key: string } ) => void;
	} ) => (
		<div>
			<p>Selected: { props.selectedKey ?? 'none' }</p>
			{ props.conversations.map( ( conversation ) => (
				<button key={ conversation.key } onClick={ () => props.onSelect( conversation ) }>
					{ conversation.key }
				</button>
			) ) }
		</div>
	),
} ) );

jest.mock( '../conversation-detail', () => ( {
	ConversationDetail: ( props: {
		siteId: number;
		postId: number;
		onPrevious?: () => void;
		onNext?: () => void;
	} ) => (
		<div>
			<p>Detail: { `${ props.siteId }-${ props.postId }` }</p>
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
import { useCommentNotes, useMarkNotesRead } from 'calypso/reader/data/notifications';
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
	jest.mocked( page.show ).mockReset();
	jest.mocked( page.replace ).mockReset();
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

		expect( markRead ).toHaveBeenCalledWith( [ 2 ] );
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/200' );
	} );

	it( 'does not mark an already-read conversation as read when opened', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '100' } );

		await user.click( screen.getByRole( 'button', { name: '10-300' } ) );

		expect( markRead ).not.toHaveBeenCalled();
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/300' );
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

		expect( markRead ).toHaveBeenCalledWith( [ 1 ] );
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/100' );
	} );

	it( 'opens the next conversation without marking it as read when it has no unread notes', async () => {
		const user = userEvent.setup();
		renderInbox( { siteId: '10', postId: '200' } );

		await user.click( screen.getByRole( 'button', { name: 'next' } ) );

		expect( markRead ).not.toHaveBeenCalled();
		expect( page.show ).toHaveBeenCalledWith( '/reader/conversations/inbox/10/300' );
	} );
} );
