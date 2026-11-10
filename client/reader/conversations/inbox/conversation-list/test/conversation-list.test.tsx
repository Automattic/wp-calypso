/**
 * @jest-environment jsdom
 */
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
	adaptReadConversation,
	adaptReadConversationOwnComment,
	type OwnComment,
} from 'calypso/reader/data/conversations';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationList } from '..';
import { makeConversation, makeOwnComment } from '../../test/helpers';
import type { InboxItem } from '../list-item';
import type { InboxTab } from '../tabs';
import type { Density } from '../toolbar';

const conversations = [
	makeConversation( {
		postId: 100,
		title: 'Unread post',
		commenters: [ 'Ana', 'Bruno' ],
		unreadNoteIds: [ 1, 2 ],
	} ),
	makeConversation( { postId: 200, title: 'Read post', commenters: [ 'Carla' ] } ),
].map( adaptReadConversation );

const ownComments = [
	makeOwnComment( { postId: 300, commentId: 31, title: 'Commented post', newCommentCount: 3 } ),
	makeOwnComment( { postId: 301, commentId: 32, title: 'Commented post', excerpt: 'Again' } ),
].map( adaptReadConversationOwnComment );

function ControlledList( {
	comments = ownComments,
	...props
}: Partial< React.ComponentProps< typeof ConversationList > > & { comments?: OwnComment[] } ) {
	const [ tab, setTab ] = useState< InboxTab >( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ isShortcutsOpen, setIsShortcutsOpen ] = useState( false );
	const [ density, setDensity ] = useState< Density >( 'comfortable' );
	const items: InboxItem[] = tab === 'yours' ? comments : ( props.items ?? conversations );
	return (
		<ConversationList
			unreadCount={ 2 }
			isLoading={ false }
			tab={ tab }
			onTabChange={ setTab }
			search={ search }
			onSearchChange={ setSearch }
			density={ density }
			onDensityChange={ setDensity }
			sort="newest"
			onSortChange={ jest.fn() }
			isShortcutsOpen={ isShortcutsOpen }
			onShortcutsToggle={ setIsShortcutsOpen }
			openOnFocus
			markAllCount={ 2 }
			onMarkAllRead={ jest.fn() }
			onSelect={ jest.fn() }
			{ ...props }
			items={ items }
		/>
	);
}

const renderList = ( props: React.ComponentProps< typeof ControlledList > = {} ) => {
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

	it( 'shows the total unread count on the Unread tab', () => {
		renderList();

		expect( screen.getByRole( 'tab', { name: /Unread/ } ) ).toHaveTextContent( '2' );
	} );

	it( 'lists your comments on the Your comments tab', async () => {
		const user = userEvent.setup();
		const { onSelect } = renderList();

		await user.click( screen.getByRole( 'tab', { name: 'Your comments' } ) );

		const rows = screen.getAllByRole( 'button', { name: /^Commented post/ } );
		expect( rows ).toHaveLength( 2 );
		expect( rows[ 0 ] ).not.toHaveTextContent( 'You commented' );
		expect( rows[ 0 ] ).toHaveTextContent( 'My comment' );
		expect( rows[ 0 ] ).toHaveTextContent( '3 new' );
		expect( rows[ 1 ] ).not.toHaveTextContent( 'new' );

		await user.click( rows[ 1 ] );

		expect( onSelect ).toHaveBeenCalledWith(
			expect.objectContaining( { postId: 301, commentId: 32 } ),
			'click'
		);
	} );

	it( 'shows an empty state on the Your comments tab', async () => {
		const user = userEvent.setup();
		renderList( { comments: [] } );

		await user.click( screen.getByRole( 'tab', { name: 'Your comments' } ) );

		expect( screen.getByText( 'You haven’t commented anywhere yet' ) ).toBeVisible();
	} );

	it( 'waits for the next page instead of showing an empty state', () => {
		renderList( { items: [], hasMore: true } );

		expect( screen.queryByText( 'Conversations will appear here' ) ).not.toBeInTheDocument();
	} );

	it( 'retries a page that failed to load', async () => {
		const user = userEvent.setup();
		const onLoadMore = jest.fn();
		renderList( { hasMore: true, isLoadMoreError: true, onLoadMore } );

		await user.click( screen.getByRole( 'button', { name: 'Retry' } ) );

		expect( screen.getByText( 'Couldn’t load more.' ) ).toBeVisible();
		expect( onLoadMore ).toHaveBeenCalledTimes( 1 );
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

	it( 'shows an empty state when there are no conversations', () => {
		renderList( { items: [] } );

		expect( screen.getByText( 'Conversations will appear here' ) ).toBeVisible();
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

	it( 'leaves Tab alone when rows do not open on focus', async () => {
		const user = userEvent.setup();
		const { onSelect } = renderList( { openOnFocus: false } );

		await user.click( screen.getByRole( 'button', { name: /^Unread post/ } ) );
		onSelect.mockClear();
		await user.tab();

		expect( onSelect ).not.toHaveBeenCalled();
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
