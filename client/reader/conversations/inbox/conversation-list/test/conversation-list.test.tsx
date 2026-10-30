/**
 * @jest-environment jsdom
 */
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationList } from '..';
import { groupNotesByPost } from '../../group-notes';
import { makeNote } from '../../test/helpers';
import { filterConversations } from '../filter-conversations';
import type { InboxTab } from '../tabs';

const conversations = groupNotesByPost( [
	makeNote( { id: 1, postId: 100, title: 'Unread post', commenter: 'Ana', read: 0 } ),
	makeNote( { id: 2, postId: 100, title: 'Unread post', commenter: 'Bruno', read: 0 } ),
	makeNote( { id: 3, postId: 200, title: 'Read post', commenter: 'Carla', read: 1 } ),
] );

function ControlledList( props: Partial< React.ComponentProps< typeof ConversationList > > ) {
	const [ tab, setTab ] = useState< InboxTab >( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ isShortcutsOpen, setIsShortcutsOpen ] = useState( false );
	const source = props.conversations ?? conversations;
	return (
		<ConversationList
			unreadCount={ source.reduce(
				( total, { unreadNoteIds } ) => total + unreadNoteIds.length,
				0
			) }
			isLoading={ false }
			tab={ tab }
			onTabChange={ setTab }
			search={ search }
			onSearchChange={ setSearch }
			sort="newest_replies"
			onSortChange={ jest.fn() }
			isShortcutsOpen={ isShortcutsOpen }
			onShortcutsToggle={ setIsShortcutsOpen }
			onSelect={ jest.fn() }
			{ ...props }
			conversations={ filterConversations( source, tab, search ) }
		/>
	);
}

const renderList = ( props: Partial< React.ComponentProps< typeof ConversationList > > = {} ) => {
	const onSelect = jest.fn();
	const { rerender } = renderWithProvider( <ControlledList onSelect={ onSelect } { ...props } /> );
	return {
		onSelect,
		rerender: ( nextProps: typeof props ) =>
			rerender( <ControlledList onSelect={ onSelect } { ...nextProps } /> ),
	};
};

describe( 'ConversationList', () => {
	let scrollIntoView: jest.Mock;

	beforeEach( () => {
		// jsdom does not implement scrollIntoView.
		scrollIntoView = jest.fn();
		window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
	} );

	it( 'lists one item per post under a day header', () => {
		renderList();

		expect( screen.getByRole( 'heading', { name: 'Today' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^Unread post/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /^Read post/ } ) ).toBeVisible();
	} );

	it( 'summarises commenters and the unread count', () => {
		renderList();

		const item = screen.getByRole( 'button', { name: /^Unread post/ } );
		expect( item ).toHaveTextContent( 'and 1 other' );
		expect( item ).toHaveTextContent( '2 new' );
	} );

	it( 'shows only conversations with unread notes on the Unread tab', async () => {
		const user = userEvent.setup();
		renderList();

		await user.click( screen.getByRole( 'tab', { name: /Unread/ } ) );

		expect( screen.getByRole( 'button', { name: /^Unread post/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /^Read post/ } ) ).not.toBeInTheDocument();
	} );

	it( 'shows the total unread count on the Unread tab', () => {
		renderList();

		expect( screen.getByRole( 'tab', { name: /Unread/ } ) ).toHaveTextContent( '2' );
	} );

	it( 'shows an empty state on the Your comments tab', async () => {
		const user = userEvent.setup();
		renderList();

		await user.click( screen.getByRole( 'tab', { name: 'Your comments' } ) );

		expect( screen.getByText( 'Conversations you commented on will show up here.' ) ).toBeVisible();
	} );

	it( 'filters conversations by search term', async () => {
		const user = userEvent.setup();
		renderList();

		await user.type( screen.getByRole( 'searchbox' ), 'unread' );

		expect( screen.getByRole( 'button', { name: /^Unread post/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /^Read post/ } ) ).not.toBeInTheDocument();
	} );

	it( 'selects a conversation on click', async () => {
		const user = userEvent.setup();
		const { onSelect } = renderList();

		await user.click( screen.getByRole( 'button', { name: /^Read post/ } ) );

		expect( onSelect ).toHaveBeenCalledTimes( 1 );
		expect( onSelect ).toHaveBeenCalledWith( expect.objectContaining( { postId: 200 } ), 'click' );
	} );

	it( 'shows the new count only on conversations with unread notes', () => {
		renderList();

		expect( screen.getByRole( 'button', { name: /^Unread post/ } ) ).toHaveTextContent( '2 new' );
		expect( screen.getByRole( 'button', { name: /^Read post/ } ) ).not.toHaveTextContent( 'new' );
	} );

	it( 'marks only the selected conversation as current', () => {
		renderList( { selectedKey: conversations[ 1 ].key } );

		expect( screen.getByRole( 'button', { name: /^Read post/ } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect( screen.getByRole( 'button', { name: /^Unread post/ } ) ).not.toHaveAttribute(
			'aria-current'
		);
	} );

	it( 'shows settings as disabled until it is built', () => {
		renderList();

		expect( screen.getByRole( 'button', { name: 'Settings are coming soon' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'shows an empty state when there are no conversations', () => {
		renderList( { conversations: [] } );

		expect( screen.getByText( 'No conversations yet.' ) ).toBeVisible();
	} );

	it( 'lists the keyboard shortcuts from the header button', async () => {
		const user = userEvent.setup();
		renderList();

		await user.click( screen.getByRole( 'button', { name: 'Keyboard shortcuts' } ) );

		expect( screen.getByText( 'View unread' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Toggle shortcuts menu' ) ).toBeInTheDocument();
	} );

	it( 'scrolls the selected conversation into view', () => {
		renderList( { selectedKey: conversations[ 1 ].key } );

		expect( scrollIntoView ).toHaveBeenCalledTimes( 1 );
		expect( scrollIntoView ).toHaveBeenCalledWith( { block: 'nearest' } );
	} );

	it( 'moves the focus to a conversation selected from the keyboard', () => {
		const { rerender } = renderList( { selectedKey: conversations[ 0 ].key } );

		rerender( { selectedKey: conversations[ 1 ].key } );

		expect( screen.getByRole( 'button', { name: /^Read post/ } ) ).toHaveFocus();
	} );

	it( 'leaves the focus alone when it is outside the list', async () => {
		const user = userEvent.setup();
		const { rerender } = renderList( { selectedKey: conversations[ 0 ].key } );

		await user.click( screen.getByRole( 'searchbox' ) );
		rerender( { selectedKey: conversations[ 1 ].key } );

		expect( screen.getByRole( 'searchbox' ) ).toHaveFocus();
	} );

	it( 'does not take the focus on the first render', () => {
		renderList( { selectedKey: conversations[ 1 ].key } );

		expect( screen.getByRole( 'button', { name: /^Read post/ } ) ).not.toHaveFocus();
	} );

	it( 'opens the conversation that Tab moves to', async () => {
		const user = userEvent.setup();
		const { onSelect } = renderList( { selectedKey: conversations[ 0 ].key } );

		await user.click( screen.getByRole( 'button', { name: /^Unread post/ } ) );
		onSelect.mockClear();
		await user.tab();

		expect( onSelect ).toHaveBeenCalledTimes( 1 );
		expect( onSelect ).toHaveBeenCalledWith(
			expect.objectContaining( { postId: 200 } ),
			'tab_key'
		);
	} );

	it( 'reports Tab, not click, after a click that did not focus the row', async () => {
		const user = userEvent.setup();
		const readPost = conversations.find( ( { postId } ) => postId === 200 );
		const { onSelect } = renderList( { selectedKey: readPost?.key } );
		const unreadRow = screen.getByRole( 'button', { name: /^Unread post/ } );

		await user.click( screen.getByRole( 'button', { name: /^Read post/ } ) );
		// Safari doesn't focus a button on click, and userEvent always does.
		fireEvent.pointerDown( unreadRow );
		fireEvent.click( unreadRow );
		onSelect.mockClear();
		await user.tab( { shift: true } );

		expect( onSelect ).toHaveBeenCalledTimes( 1 );
		expect( onSelect ).toHaveBeenCalledWith(
			expect.objectContaining( { postId: 100 } ),
			'tab_key'
		);
	} );

	it( 'reports Tab, not click, after a press dragged off the row that has focus', async () => {
		const user = userEvent.setup();
		const readPost = conversations.find( ( { postId } ) => postId === 200 );
		const { onSelect } = renderList( { selectedKey: readPost?.key } );
		const unreadRow = screen.getByRole( 'button', { name: /^Unread post/ } );

		await user.click( unreadRow );
		await user.pointer( [
			{ keys: '[MouseLeft>]', target: unreadRow },
			{ target: document.body },
			{ keys: '[/MouseLeft]' },
		] );
		await user.tab();
		onSelect.mockClear();
		await user.tab( { shift: true } );

		expect( onSelect ).toHaveBeenCalledTimes( 1 );
		expect( onSelect ).toHaveBeenCalledWith(
			expect.objectContaining( { postId: 100 } ),
			'tab_key'
		);
	} );
} );
