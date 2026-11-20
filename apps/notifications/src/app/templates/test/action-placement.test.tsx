/**
 * @vitest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { approveNote } from '../../../panel/state/notes/actions';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
import NoteActions from '../actions';
import SimplifiedActions from '../simplified-actions';

const noop = () => {};

let isLargeScreen = true;
let footerWidth: number | undefined;
vi.mock( '@wordpress/compose', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '@wordpress/compose' ) >() ),
	useViewportMatch: () => isLargeScreen,
	// Reports the footer's width as it mounts, as a ResizeObserver would in a browser.
	useResizeObserver:
		( callback: ( entries: Array< { contentRect: { width: number } } > ) => void ) =>
		( element: HTMLElement | null ) => {
			if ( element && footerWidth !== undefined ) {
				callback( [ { contentRect: { width: footerWidth } } ] );
			}
		},
} ) );

// Approving only updates the store, and marking as spam is up to each test, so no request is made.
const { spamNote } = vi.hoisted( () => ( { spamNote: vi.fn() } ) );
vi.mock( '../../../panel/state/notes/thunks', async ( importOriginal ) => ( {
	...( await importOriginal< typeof import( '../../../panel/state/notes/thunks' ) >() ),
	setApproveStatus: ( noteId: number, _siteId: number, _commentId: number, isApproved: boolean ) =>
		approveNote( noteId, isApproved ),
	spamNote:
		( ...args: unknown[] ) =>
		() =>
			spamNote( ...args ),
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

	describe( 'with expanded actions, as on the full page', () => {
		const renderExpanded = ( expandedNote: never ) =>
			renderWithProvider(
				<AppProvider client={ null } locale="en" hasExpandedActions>
					<SimplifiedActions note={ expandedNote } goBack={ noop } />
				</AppProvider>
			);

		beforeEach( () => {
			isLargeScreen = true;
			footerWidth = undefined;
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
			footerWidth = 300;
			renderExpanded( note );

			expect(
				screen.queryByRole( 'button', { name: 'Mark comment as spam' } )
			).not.toBeInTheDocument();

			await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

			expect( await screen.findByRole( 'menuitem', { name: 'Unapprove' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Mark as spam' } ) ).toBeVisible();
		} );

		it( 'shows them as buttons once the note is wide enough', () => {
			footerWidth = 400;
			renderExpanded( note );

			expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) ).toBeVisible();
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
