/**
 * @vitest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { store } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { approveNote } from '../../../panel/state/notes/actions';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
import NoteActions from '../actions';
import SimplifiedActions from '../simplified-actions';

const noop = () => {};

let isLargeScreen = true;
// Reports the footer's width as a ResizeObserver does in a browser: after layout, outside React.
let reportFooterWidth: ( width: number ) => void = () => {};
vi.mock( '@wordpress/compose', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@wordpress/compose' ) >() ),
	useViewportMatch: () => isLargeScreen,
	useResizeObserver: (
		callback: (
			entries: Array< { contentRect: { width: number }; target: Element | null } >
		) => void
	) => {
		reportFooterWidth = ( width ) =>
			callback( [
				{ contentRect: { width }, target: document.querySelector( '.components-card__footer' ) },
			] );
		return () => {};
	},
} ) );

// Approving updates the store, and when the request lands and whether marking as spam works are
// up to each test, so no request is made.
const { approveRequest, spamNote, trashNote } = vi.hoisted( () => ( {
	approveRequest: vi.fn(),
	spamNote: vi.fn(),
	trashNote: vi.fn(),
} ) );
vi.mock( '../../../panel/state/notes/thunks', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '../../../panel/state/notes/thunks' ) >() ),
	setApproveStatus:
		( noteId: number, _siteId: number, _commentId: number, isApproved: boolean ) =>
		( dispatch: ( action: unknown ) => void ) => {
			dispatch( approveNote( noteId, isApproved ) );
			return approveRequest( isApproved );
		},
	spamNote:
		( ...args: unknown[] ) =>
		() =>
			spamNote( ...args ),
	trashNote:
		( ...args: unknown[] ) =>
		() =>
			trashNote( ...args ),
} ) );

const note = {
	id: 1,
	type: 'comment',
	subject: [ { text: 'Jane Doe', ranges: [] } ],
	body: [
		{
			type: 'comment',
			text: 'A short reply',
			actions: {
				'approve-comment': true,
				'edit-comment': true,
				'spam-comment': true,
				'trash-comment': true,
			},
		},
	],
	meta: { ids: { site: 10, comment: 20, post: 30 } },
} as never;

describe( 'comment action placement', () => {
	it( 'renders Spam and Trash as inline action buttons alongside the safe actions', () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteActions note={ note } goBack={ noop } />
			</AppProvider>
		);

		// Buttons expose their tooltip title as the accessible name. The fixture's
		// comment is already approved, so the approve toggle reads "Unapprove comment".
		expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Edit comment' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Trash comment' } ) ).toBeInTheDocument();
	} );

	it( 'collects the comment actions in the Actions menu in the simplified layout', async () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<SimplifiedActions note={ note } goBack={ noop } />
			</AppProvider>
		);

		expect( screen.queryByRole( 'menuitem', { name: 'Move to trash' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Edit' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Unapprove' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Mark as spam' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Move to trash' } ) ).toBeInTheDocument();
	} );

	const pendingNote = ( actions: Record< string, boolean > ) =>
		( {
			...( note as object ),
			body: [ { type: 'comment', text: 'A short reply', actions } ],
		} ) as never;

	it( 'puts Approve beside Like instead of in the menu while the comment is pending', async () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<SimplifiedActions
					note={ pendingNote( {
						'approve-comment': false,
						'edit-comment': true,
						'trash-comment': true,
					} ) }
					goBack={ noop }
				/>
			</AppProvider>
		);

		expect( screen.getByRole( 'button', { name: 'Approve comment' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Edit' } ) ).toBeVisible();
		expect( screen.queryByRole( 'menuitem', { name: /approve/i } ) ).not.toBeInTheDocument();
	} );

	it( 'drops the Actions menu when Approve is the only moderation action', () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<SimplifiedActions note={ pendingNote( { 'approve-comment': false } ) } goBack={ noop } />
			</AppProvider>
		);

		expect( screen.getByRole( 'button', { name: 'Approve comment' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();
	} );

	// The same footer shows the next note opened while a request is out, as with j or k in the panel.
	const otherNote = ( shown: never ) => ( { ...( shown as object ), id: 2 } ) as never;
	const show = ( ui: React.ReactElement ) => (
		<Provider store={ store }>
			<AppProvider client={ null } locale="en">
				{ ui }
			</AppProvider>
		</Provider>
	);

	it( 'shows a pending Mark as spam as busy only on the notes it was chosen on', async () => {
		const user = userEvent.setup();
		spamNote.mockReset().mockImplementation( () => new Promise( () => {} ) );
		const { rerender } = renderWithProvider(
			<AppProvider client={ null } locale="en">
				<SimplifiedActions note={ note } goBack={ noop } />
			</AppProvider>
		);
		const toggle = () => screen.getByRole( 'button', { name: 'Actions' } );
		await user.click( toggle() );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Mark as spam' } ) );
		expect( toggle() ).toHaveAttribute( 'aria-disabled', 'true' );

		rerender( show( <SimplifiedActions note={ otherNote( note ) } goBack={ noop } /> ) );

		expect( toggle() ).not.toHaveAttribute( 'aria-disabled', 'true' );

		await user.click( toggle() );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Mark as spam' } ) );
		rerender( show( <SimplifiedActions note={ note } goBack={ noop } /> ) );

		expect( toggle() ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( spamNote ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'shows a pending Trash as busy only on the note it was pressed on', async () => {
		const user = userEvent.setup();
		trashNote.mockReset().mockImplementation( () => new Promise( () => {} ) );
		const { rerender } = renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteActions note={ note } goBack={ noop } />
			</AppProvider>
		);
		const trash = () => screen.getByRole( 'button', { name: 'Trash comment' } );
		await user.click( trash() );
		expect( trash() ).toHaveAttribute( 'aria-disabled', 'true' );

		rerender( show( <NoteActions note={ otherNote( note ) } goBack={ noop } /> ) );

		expect( trash() ).not.toHaveAttribute( 'aria-disabled', 'true' );

		await user.click( trash() );
		rerender( show( <NoteActions note={ note } goBack={ noop } /> ) );

		expect( trash() ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	it( 'sends one Trash at a time from the t shortcut, and another once it fails', async () => {
		const user = userEvent.setup();
		let fail: ( error: Error ) => void = noop;
		trashNote
			.mockReset()
			.mockImplementation( () => new Promise( ( _resolve, reject ) => ( fail = reject ) ) );
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteActions note={ note } goBack={ noop } />
			</AppProvider>
		);
		act( () => {
			store.dispatch( actions.ui.enableKeyboardShortcuts() );
		} );

		await user.keyboard( 't' );
		await user.keyboard( 't' );

		expect( trashNote ).toHaveBeenCalledTimes( 1 );

		await act( async () => fail( new Error( 'Offline' ) ) );

		expect( screen.getByRole( 'button', { name: 'Trash comment' } ) ).not.toHaveAttribute(
			'aria-disabled',
			'true'
		);

		await user.keyboard( 't' );

		expect( trashNote ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'sends one approval at a time from the a shortcut', async () => {
		const user = userEvent.setup();
		approveRequest.mockReset().mockImplementation( () => new Promise( () => {} ) );
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteActions note={ pendingNote( { 'approve-comment': false } ) } goBack={ noop } />
			</AppProvider>
		);
		act( () => {
			store.dispatch( actions.ui.enableKeyboardShortcuts() );
		} );

		await user.keyboard( 'a' );
		await user.keyboard( 'a' );

		expect( approveRequest.mock.calls ).toEqual( [ [ true ] ] );
	} );

	describe( 'with expanded actions, as on the full page', () => {
		const approve = () => screen.getByRole( 'button', { name: 'Approve comment' } );
		const renderExpanded = ( expandedNote: never ) =>
			renderWithProvider(
				<AppProvider client={ null } locale="en" hasExpandedActions>
					<SimplifiedActions note={ expandedNote } goBack={ noop } />
				</AppProvider>
			);
		const expanded = ( shown: never ) => (
			<Provider store={ store }>
				<AppProvider client={ null } locale="en" hasExpandedActions>
					<SimplifiedActions note={ shown } goBack={ noop } />
				</AppProvider>
			</Provider>
		);

		beforeEach( () => {
			isLargeScreen = true;
			approveRequest.mockReset();
			spamNote.mockReset();
		} );

		it( 'keeps the focus on the button as Approve and Unapprove swap', async () => {
			const user = userEvent.setup();
			renderExpanded( pendingNote( { 'approve-comment': false, 'spam-comment': true } ) );

			await user.click( screen.getByRole( 'button', { name: 'Approve comment' } ) );

			expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toHaveFocus();

			await user.click( screen.getByRole( 'button', { name: 'Unapprove comment' } ) );

			expect( screen.getByRole( 'button', { name: 'Approve comment' } ) ).toHaveFocus();
		} );

		it.each( [
			[
				'a double click',
				( user: ReturnType< typeof userEvent.setup > ) => user.dblClick( approve() ),
			],
			[
				'pressing Enter twice',
				async ( user: ReturnType< typeof userEvent.setup > ) => {
					approve().focus();
					await user.keyboard( '{Enter}{Enter}' );
				},
			],
		] )( 'sends one approval at a time, on %s', async ( _, pressTwice ) => {
			const user = userEvent.setup();
			let land = () => {};
			approveRequest.mockImplementation(
				() => new Promise< void >( ( resolve ) => ( land = resolve ) )
			);
			renderExpanded( pendingNote( { 'approve-comment': false, 'spam-comment': true } ) );

			await pressTwice( user );

			expect( approveRequest.mock.calls ).toEqual( [ [ true ] ] );
			const unapprove = screen.getByRole( 'button', { name: 'Unapprove comment' } );
			expect( unapprove ).toHaveFocus();
			expect( unapprove ).toHaveAttribute( 'aria-disabled', 'true' );

			await act( async () => land() );
			await user.click( unapprove );

			expect( approveRequest.mock.calls ).toEqual( [ [ true ], [ false ] ] );
		} );

		it( 'shows a pending Approve or Spam as busy only on the notes it was pressed on', async () => {
			const user = userEvent.setup();
			approveRequest.mockImplementation( () => new Promise( () => {} ) );
			spamNote.mockImplementation( () => new Promise( () => {} ) );
			const first = pendingNote( { 'approve-comment': false, 'spam-comment': true } );
			const { rerender } = renderExpanded( first );
			const spam = () => screen.getByRole( 'button', { name: 'Mark comment as spam' } );
			await user.click( approve() );
			await user.click( spam() );

			rerender( expanded( otherNote( first ) ) );

			expect( approve() ).not.toHaveAttribute( 'aria-disabled', 'true' );
			expect( spam() ).not.toHaveAttribute( 'aria-disabled', 'true' );

			await user.click( approve() );
			await user.click( spam() );
			rerender( expanded( first ) );

			expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
			expect( spam() ).toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'keeps Approve busy on a note while another note’s approval lands', async () => {
			const user = userEvent.setup();
			const answers: ( () => void )[] = [];
			approveRequest.mockImplementation(
				() => new Promise< void >( ( resolve ) => answers.push( resolve ) )
			);
			const first = pendingNote( { 'approve-comment': false } );
			const { rerender } = renderExpanded( first );
			const unapprove = () => screen.getByRole( 'button', { name: 'Unapprove comment' } );
			await user.click( approve() );
			rerender( expanded( otherNote( first ) ) );
			await user.click( approve() );

			await act( async () => answers[ 0 ]() );

			expect( unapprove() ).toHaveAttribute( 'aria-disabled', 'true' );

			rerender( expanded( first ) );

			expect( unapprove() ).not.toHaveAttribute( 'aria-disabled', 'true' );
		} );

		it( 'goes back once the comment is marked as spam', async () => {
			const user = userEvent.setup();
			const goBack = vi.fn();
			spamNote.mockResolvedValue( undefined );
			renderWithProvider(
				<AppProvider client={ null } locale="en" hasExpandedActions>
					<SimplifiedActions note={ note } goBack={ goBack } />
				</AppProvider>
			);

			await user.click( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) );

			await waitFor( () => expect( goBack ).toHaveBeenCalledTimes( 1 ) );
			expect( spamNote ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'lets Spam be tried again when it fails', async () => {
			const user = userEvent.setup();
			const goBack = vi.fn();
			spamNote.mockRejectedValue( { status: 500 } );
			renderWithProvider(
				<AppProvider client={ null } locale="en" hasExpandedActions>
					<SimplifiedActions note={ note } goBack={ goBack } />
				</AppProvider>
			);
			const spam = screen.getByRole( 'button', { name: 'Mark comment as spam' } );

			await user.click( spam );

			await waitFor( () => expect( spam ).not.toHaveAttribute( 'aria-disabled', 'true' ) );
			expect( goBack ).not.toHaveBeenCalled();

			await user.click( spam );

			expect( spamNote ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'puts Unapprove and Spam beside Like on an approved comment', async () => {
			renderExpanded( note );

			expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) ).toBeVisible();

			await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

			expect( await screen.findByRole( 'menuitem', { name: 'Edit' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Move to trash' } ) ).toBeVisible();
			expect( screen.queryByRole( 'menuitem', { name: 'Unapprove' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'menuitem', { name: 'Mark as spam' } ) ).not.toBeInTheDocument();
		} );

		it( 'puts Approve and Spam beside Like on a pending comment', async () => {
			renderExpanded(
				pendingNote( {
					'approve-comment': false,
					'edit-comment': true,
					'spam-comment': true,
					'trash-comment': true,
				} )
			);

			expect( screen.getByRole( 'button', { name: 'Approve comment' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) ).toBeVisible();

			await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

			expect( await screen.findByRole( 'menuitem', { name: 'Edit' } ) ).toBeVisible();
			expect( screen.queryByRole( 'menuitem', { name: 'Mark as spam' } ) ).not.toBeInTheDocument();
		} );

		it( 'shows Spam even when it is the only action', () => {
			renderExpanded( pendingNote( { 'spam-comment': true } ) );

			expect( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) ).toBeVisible();
			expect( screen.queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();
		} );

		it( 'keeps them in the Actions menu below the two-pane width', async () => {
			isLargeScreen = false;
			renderExpanded( note );

			expect(
				screen.queryByRole( 'button', { name: 'Mark comment as spam' } )
			).not.toBeInTheDocument();

			await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

			expect( await screen.findByRole( 'menuitem', { name: 'Unapprove' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Mark as spam' } ) ).toBeVisible();
		} );

		it( 'keeps them in the Actions menu while the note is too narrow for them', async () => {
			renderExpanded( note );
			act( () => reportFooterWidth( 300 ) );

			expect(
				screen.queryByRole( 'button', { name: 'Mark comment as spam' } )
			).not.toBeInTheDocument();

			await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

			expect( await screen.findByRole( 'menuitem', { name: 'Unapprove' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Mark as spam' } ) ).toBeVisible();
		} );

		it( 'shows them as buttons once the note is wide enough', () => {
			renderExpanded( note );
			act( () => reportFooterWidth( 400 ) );

			expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) ).toBeVisible();
		} );

		it.each( [ 'Unapprove comment', 'Mark comment as spam' ] )(
			'hands the focus to Actions when a focused %s moves into the menu',
			( name ) => {
				renderExpanded( note );
				act( () => reportFooterWidth( 500 ) );
				screen.getByRole( 'button', { name } ).focus();

				act( () => reportFooterWidth( 300 ) );

				expect( screen.queryByRole( 'button', { name } ) ).not.toBeInTheDocument();
				expect( screen.getByRole( 'button', { name: 'Actions' } ) ).toHaveFocus();
			}
		);

		it( 'leaves the focus where it is when it isn’t on a button that moves', () => {
			renderExpanded(
				pendingNote( { 'approve-comment': false, 'spam-comment': true, 'edit-comment': true } )
			);
			act( () => reportFooterWidth( 500 ) );
			approve().focus();

			act( () => reportFooterWidth( 300 ) );

			expect(
				screen.queryByRole( 'button', { name: 'Mark comment as spam' } )
			).not.toBeInTheDocument();
			expect( approve() ).toHaveFocus();
		} );

		it( 'moves them into the menu before a note too narrow for them is painted', () => {
			renderExpanded( note );

			act( () => {
				reportFooterWidth( 300 );
				// Checked inside the observer's turn, before anything scheduled for later renders.
				expect(
					screen.queryByRole( 'button', { name: 'Mark comment as spam' } )
				).not.toBeInTheDocument();
			} );
		} );

		it( 'leaves the panel as it is', () => {
			renderWithProvider(
				<AppProvider client={ null } locale="en">
					<SimplifiedActions note={ note } goBack={ noop } />
				</AppProvider>
			);

			expect(
				screen.queryByRole( 'button', { name: 'Mark comment as spam' } )
			).not.toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Actions' } ) ).toBeVisible();
		} );
	} );
} );
