import { act, render, screen } from '@testing-library/react';
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
vi.mock( '../../panel/rest-client/wpcom', () => ( {
	init: vi.fn(),
	listNotes: vi.fn( async () => ( { notes: [] } ) ),
	markReadStatus: vi.fn(),
	markPostAsSeen: vi.fn(),
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

describe( 'NotificationApp', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = () => {};
	} );

	beforeEach( () => {
		initState();
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
} );
