/**
 * @vitest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import repliesCache from '../../../panel/comment-replies-cache';
import { init as initWpcom } from '../../../panel/rest-client/wpcom';
import { store } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider, NoteOpenContext } from '../../context';
import CommentReplyInput from '../comment-reply-input';

const note = {
	id: 1,
	type: 'comment',
	meta: { ids: { site: 10, comment: 20, post: 30 } },
} as never;

describe( 'CommentReplyInput', () => {
	const reply = vi.fn();

	const renderReplyInput = () =>
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<CommentReplyInput note={ note } defaultValue="Reply to Jane" />
				<button>Elsewhere on the page</button>
			</AppProvider>
		);

	beforeEach( () => {
		reply.mockClear();
		window.localStorage.clear();
		initWpcom( {
			site: () => ( { comment: () => ( { reply } ) } ),
			req: { get: vi.fn() },
		} );
	} );

	const enableShortcuts = () =>
		act( () => {
			store.dispatch( actions.ui.enableKeyboardShortcuts() );
		} );

	it.each( [
		[ 'r', 'r' ],
		[ 'Shift+R', '{Shift>}R{/Shift}' ],
	] )( 'goes to the reply box on %s', async ( _key, keys ) => {
		const user = userEvent.setup();
		renderReplyInput();
		enableShortcuts();

		await user.keyboard( keys );

		expect( screen.getByPlaceholderText( 'Reply to Jane' ) ).toHaveFocus();
		expect( screen.getByPlaceholderText( 'Reply to Jane' ) ).toHaveValue( '' );
	} );

	it( 'leaves the focus where it is on Ctrl+R, or with the shortcuts off', async () => {
		const user = userEvent.setup();
		renderReplyInput();

		await user.keyboard( 'r' );
		enableShortcuts();
		await user.keyboard( '{Control>}r{/Control}' );

		expect( screen.getByPlaceholderText( 'Reply to Jane' ) ).not.toHaveFocus();
	} );

	it( 'leaves the focus where it is on r once its note has closed', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteOpenContext.Provider value={ false }>
					<CommentReplyInput note={ note } defaultValue="Reply to Jane" />
				</NoteOpenContext.Provider>
			</AppProvider>
		);
		enableShortcuts();

		await user.keyboard( 'r' );

		expect( screen.getByPlaceholderText( 'Reply to Jane' ) ).not.toHaveFocus();
	} );

	it.each( [
		[ 'Ctrl', '{Control>}{Enter}{/Control}' ],
		[ 'Cmd', '{Meta>}{Enter}{/Meta}' ],
	] )( 'posts the reply on %s+Enter from the reply box', async ( _modifier, keys ) => {
		const user = userEvent.setup();
		renderReplyInput();

		await user.type( screen.getByPlaceholderText( 'Reply to Jane' ), 'Thank you' );
		await user.keyboard( keys );

		expect( reply ).toHaveBeenCalledTimes( 1 );
		expect( reply ).toHaveBeenCalledWith( 'Thank you', expect.any( Function ) );
	} );

	it( 'posts the reply on Ctrl+Enter from the submit button', async () => {
		const user = userEvent.setup();
		renderReplyInput();

		await user.type( screen.getByPlaceholderText( 'Reply to Jane' ), 'Thank you' );
		screen.getByRole( 'button', { name: 'Submit reply' } ).focus();
		await user.keyboard( '{Control>}{Enter}{/Control}' );

		expect( reply ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not post a typed reply on Ctrl+Enter pressed elsewhere on the page', async () => {
		const user = userEvent.setup();
		renderReplyInput();

		await user.type( screen.getByPlaceholderText( 'Reply to Jane' ), 'Thank you' );
		await user.click( screen.getByRole( 'button', { name: 'Elsewhere on the page' } ) );
		await user.keyboard( '{Control>}{Enter}{/Control}' );
		await user.keyboard( '{Meta>}{Enter}{/Meta}' );

		expect( reply ).not.toHaveBeenCalled();
	} );

	it( 'does not post a restored draft on Ctrl+Enter pressed elsewhere on the page', async () => {
		const user = userEvent.setup();
		repliesCache.setItem( 'reply_1', [ 'A draft from earlier', Date.now() ] );
		renderReplyInput();

		expect( screen.getByDisplayValue( 'A draft from earlier' ) ).toBeVisible();
		await user.click( screen.getByRole( 'button', { name: 'Elsewhere on the page' } ) );
		await user.keyboard( '{Control>}{Enter}{/Control}' );

		expect( reply ).not.toHaveBeenCalled();
	} );
} );
