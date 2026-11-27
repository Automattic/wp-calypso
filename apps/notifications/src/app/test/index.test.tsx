import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { store, init as initState } from '../../panel/state';
import actions from '../../panel/state/actions';
import NotificationApp from '../index';

vi.mock( '../../panel/rest-client', () => ( {
	default: vi.fn( function () {
		return {
			getNote: vi.fn(),
			hasMoreNotes: () => false,
			loadMore: vi.fn(),
			setFilter: vi.fn(),
			setLocale: vi.fn(),
			setVisibility: vi.fn(),
		};
	} ),
} ) );
// Each comment request the note's actions make, by what it does.
const { commentRequests } = vi.hoisted( () => ( { commentRequests: [] as string[] } ) );
vi.mock( '../../panel/rest-client/wpcom', () => ( {
	init: vi.fn(),
	fetchSuggestions: vi.fn(),
	listNotes: vi.fn( async () => ( { notes: [] } ) ),
	markReadStatus: vi.fn(),
	markPostAsSeen: vi.fn(),
	wpcom: () => ( {
		site: () => ( {
			comment: () => ( {
				get: async () => commentRequests.push( 'read for spam' ) && {},
				update: ( { status }: { status: string } ) => commentRequests.push( status ),
				del: async () => commentRequests.push( 'delete' ),
			} ),
		} ),
		req: {
			post: async () => commentRequests.push( 'like' ),
			del: async () => commentRequests.push( 'unlike' ),
		},
	} ),
} ) );

const makeNote = ( id: number, label: string ) => ( {
	id,
	type: 'comment',
	read: 0,
	noticon: '',
	timestamp: `2026-06-0${ id % 10 }T00:00:00+00:00`,
	title: `${ label } title`,
	subject: [ { text: label, ranges: [], media: [] } ],
	body: [],
} );

const makeComment = ( id: number, name: string ) => ( {
	...makeNote( id, `${ name } commented` ),
	read: 1,
	body: [
		{ text: name, type: 'user', ranges: [] },
		{
			text: `${ name }’s comment`,
			type: 'comment',
			actions: { 'approve-comment': true, 'edit-comment': true },
			meta: { ids: { site: 1, post: 2, comment: id } },
		},
	],
	// An actor gives the note the context the simplified layout needs, with view settings on.
	meta: { ids: { site: 1, post: 2, comment: id }, actor: { name } },
} );

// A pending comment, with every action a moderator gets.
const makePendingComment = ( id: number, name: string ) => {
	const comment = makeComment( id, name );
	return {
		...comment,
		// The reply box takes the name to reply to from the subject.
		subject: [
			{ text: `${ name } commented`, ranges: [ { type: 'user', indices: [ 0, name.length ] } ] },
		],
		body: [
			comment.body[ 0 ],
			{
				...comment.body[ 1 ],
				actions: {
					'approve-comment': false,
					'edit-comment': true,
					'like-comment': false,
					'replyto-comment': true,
					'spam-comment': false,
					'trash-comment': false,
				},
			},
		],
	};
};

describe( 'NotificationApp', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = () => {};
	} );

	beforeEach( () => {
		initState();
		commentRequests.length = 0;
	} );

	it( 'closes the open note when the tab changes', async () => {
		const user = userEvent.setup();
		store.dispatch( actions.notes.addNotes( [ makeNote( 801, 'First comment' ) ] ) );
		store.dispatch( actions.ui.loadedNotes() );
		render( <NotificationApp wpcom={ {} } /> );

		await user.click( await screen.findByRole( 'button', { name: 'First comment' } ) );

		const openNote = screen
			.getByRole( 'heading', { name: 'First comment title' } )
			.closest( '.wpnc-app__detail-pane' );
		expect( openNote ).toHaveClass( 'is-open' );

		await user.click( screen.getByRole( 'tab', { name: 'Likes' } ) );

		expect( screen.getByRole( 'tab', { name: 'Likes', selected: true } ) ).toBeVisible();
		expect( openNote ).not.toHaveClass( 'is-open' );
	} );

	it( 'goes back to the list from the note title below the two-pane width', async () => {
		const user = userEvent.setup();
		store.dispatch( actions.notes.addNotes( [ makeNote( 801, 'First comment' ) ] ) );
		store.dispatch( actions.ui.loadedNotes() );
		render( <NotificationApp wpcom={ {} } /> );

		await user.click( await screen.findByRole( 'button', { name: 'First comment' } ) );

		const back = screen.getByRole( 'button', {
			name: 'First comment title, back to notifications',
		} );
		const openNote = back.closest( '.wpnc-app__detail-pane' );
		expect( back ).toHaveTextContent( 'First comment title' );
		expect( back.closest( 'h3' ) ).toBeInTheDocument();
		expect( openNote ).toHaveClass( 'is-open' );

		await user.click( back );

		expect( openNote ).not.toHaveClass( 'is-open' );
	} );

	it.each( [ false, true ] )(
		'keeps the focus in the note when `j` opens the next one (view settings %s)',
		async ( isViewSettingsEnabled ) => {
			const user = userEvent.setup();
			store.dispatch(
				actions.notes.addNotes( [ makeComment( 802, 'Eve' ), makeComment( 801, 'Ada' ) ] )
			);
			store.dispatch( actions.ui.loadedNotes() );
			render( <NotificationApp wpcom={ {} } isViewSettingsEnabled={ isViewSettingsEnabled } /> );

			await user.click( await screen.findByRole( 'button', { name: 'Eve commented' } ) );
			const note = document.querySelector( '.wpnc-app__detail-pane' ) as HTMLElement;
			act( () => note.querySelector< HTMLElement >( '.components-card__footer button' )?.focus() );

			await user.keyboard( 'j' );

			expect( note ).toHaveTextContent( 'Ada’s comment' );
			expect( note ).toContainElement( document.activeElement as HTMLElement );
		}
	);

	it.each( [ false, true ] )(
		'turns a closed note’s shortcuts off while it slides out (view settings %s)',
		async ( isViewSettingsEnabled ) => {
			const user = userEvent.setup();
			store.dispatch( actions.notes.addNotes( [ makePendingComment( 801, 'Ben' ) ] ) );
			store.dispatch( actions.ui.loadedNotes() );
			render( <NotificationApp wpcom={ {} } isViewSettingsEnabled={ isViewSettingsEnabled } /> );
			await user.click( await screen.findByRole( 'button', { name: /^Ben commented/ } ) );
			const pane = document.querySelector( '.wpnc-app__detail-pane' ) as HTMLElement;
			const reply = within( pane ).getByRole( 'textbox' );

			await user.keyboard( 'r' );

			expect( reply ).toHaveFocus();

			act( () => reply.blur() );
			await user.keyboard( '{ArrowRight}' );

			// jsdom runs no transition, so the note stays on screen as it does while it slides out.
			expect( pane ).not.toHaveClass( 'is-open' );
			expect( pane ).toHaveTextContent( 'Ben’s comment' );

			for ( const [ key, tab ] of [
				[ 's', 'Subscribers' ],
				[ 'a', 'All' ],
				[ 'l', 'Likes' ],
			] ) {
				await user.keyboard( key );

				expect( screen.getByRole( 'tab', { name: tab, selected: true } ) ).toBeVisible();
			}
			await user.keyboard( 't' );
			await user.keyboard( 'r' );

			expect( commentRequests ).toEqual( [] );
			expect( reply ).not.toHaveFocus();
		}
	);

	it( 'leaves typing in a field outside it alone, such as the command palette’s search', async () => {
		const user = userEvent.setup();
		store.dispatch(
			actions.notes.addNotes( [
				makePendingComment( 802, 'Eve' ),
				makePendingComment( 801, 'Ben' ),
			] )
		);
		store.dispatch( actions.ui.loadedNotes() );
		render(
			<>
				<input aria-label="Search commands" />
				<NotificationApp wpcom={ {} } />
			</>
		);
		const search = screen.getByRole( 'textbox', { name: 'Search commands' } );
		const dispatch = vi.spyOn( store, 'dispatch' );

		// With no note open: the tab letters, `n`, `i` and the list's Down arrow.
		await user.type( search, 'lucas ni{ArrowDown}' );

		expect( search ).toHaveValue( 'lucas ni' );
		expect( search ).toHaveFocus();
		expect( screen.getByRole( 'tab', { name: 'All', selected: true } ) ).toBeVisible();
		expect( dispatch ).not.toHaveBeenCalledWith( actions.ui.closePanel() );
		expect( dispatch ).not.toHaveBeenCalledWith( actions.ui.toggleShortcutsPopover() );
		dispatch.mockRestore();

		// With a note open: its actions, and moving to the next note or back to the list.
		await user.click( await screen.findByRole( 'button', { name: /^Ben commented/ } ) );
		const pane = document.querySelector( '.wpnc-app__detail-pane' ) as HTMLElement;
		await user.clear( search );
		await user.type( search, 'last jk{ArrowDown}{ArrowRight}' );

		expect( search ).toHaveValue( 'last jk' );
		expect( commentRequests ).toEqual( [] );
		expect( pane ).toHaveClass( 'is-open' );
		expect( pane ).toHaveTextContent( 'Ben’s comment' );
	} );

	it( 'ignores a click, or Enter, on a closed note’s buttons while it slides out', async () => {
		const user = userEvent.setup();
		store.dispatch( actions.notes.addNotes( [ makePendingComment( 801, 'Ben' ) ] ) );
		store.dispatch( actions.ui.loadedNotes() );
		render( <NotificationApp wpcom={ {} } /> );
		await user.click( await screen.findByRole( 'button', { name: /^Ben commented/ } ) );
		const pane = document.querySelector( '.wpnc-app__detail-pane' ) as HTMLElement;
		const trash = within( pane ).getByRole( 'button', { name: 'Trash comment' } );
		act( () => trash.focus() );

		await user.keyboard( '{ArrowRight}' );

		expect( pane ).not.toHaveClass( 'is-open' );

		act( () => trash.focus() );
		await user.keyboard( '{Enter}' );
		await user.click( trash );
		await user.click( within( pane ).getByRole( 'button', { name: 'Mark comment as spam' } ) );

		expect( commentRequests ).toEqual( [] );
	} );
} );
