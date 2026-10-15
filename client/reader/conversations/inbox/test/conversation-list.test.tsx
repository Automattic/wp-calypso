/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConversationList } from '../conversation-list';
import { groupNotesByPost } from '../group-notes';
import { makeNote } from './helpers';

const conversations = groupNotesByPost( [
	makeNote( { id: 1, postId: 100, title: 'Unread post', commenter: 'Ana', read: 0 } ),
	makeNote( { id: 2, postId: 100, title: 'Unread post', commenter: 'Bruno', read: 0 } ),
	makeNote( { id: 3, postId: 200, title: 'Read post', commenter: 'Carla', read: 1 } ),
] );

const renderList = ( props: Partial< React.ComponentProps< typeof ConversationList > > = {} ) => {
	const onSelect = jest.fn();
	const onMarkAllRead = jest.fn();
	renderWithProvider(
		<ConversationList
			conversations={ conversations }
			isLoading={ false }
			onSelect={ onSelect }
			onMarkAllRead={ onMarkAllRead }
			{ ...props }
		/>
	);
	return { onSelect, onMarkAllRead };
};

describe( 'ConversationList', () => {
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

	it( 'marks every unread note as read', async () => {
		const user = userEvent.setup();
		const { onMarkAllRead } = renderList();

		await user.click( screen.getByRole( 'button', { name: /Mark 2 as read/ } ) );

		expect( onMarkAllRead ).toHaveBeenCalledWith( expect.arrayContaining( [ 1, 2 ] ) );
	} );

	it( 'hides the mark as read action when everything is read', () => {
		renderList( { conversations: groupNotesByPost( [ makeNote( { id: 1, read: 1 } ) ] ) } );

		expect( screen.queryByRole( 'button', { name: /as read/ } ) ).not.toBeInTheDocument();
	} );

	it( 'selects a conversation on click', async () => {
		const user = userEvent.setup();
		const { onSelect } = renderList();

		await user.click( screen.getByRole( 'button', { name: /^Read post/ } ) );

		expect( onSelect ).toHaveBeenCalledWith( expect.objectContaining( { postId: 200 } ) );
	} );

	it( 'shows filter and settings as disabled until they are built', () => {
		renderList();

		expect( screen.getByRole( 'button', { name: 'Filters are coming soon' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getByRole( 'button', { name: 'Settings are coming soon' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'shows an empty state when there are no conversations', () => {
		renderList( { conversations: [] } );

		expect( screen.getByText( 'No conversations yet.' ) ).toBeVisible();
	} );
} );
