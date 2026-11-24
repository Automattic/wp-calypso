/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { init as initWpcom } from '../../../../rest-client/wpcom';
import { UndoListItem } from '../../../../templates/undo-list-item';
import trashNote from '../trash-note';

const note = {
	id: 1,
	type: 'comment',
	meta: { ids: { site: 10, comment: 100 } },
};

describe( 'Trash', () => {
	let comment;

	beforeEach( () => {
		window._tkq = [];
		comment = { update: vi.fn( async () => ( {} ) ), del: vi.fn( async () => ( {} ) ) };
		initWpcom( { site: () => ( { comment: () => comment } ) } );
	} );

	// Deleting a comment that is already in spam or the trash deletes it for good.
	it( 'moves the comment to the trash instead of deleting it', async () => {
		const dispatch = vi.fn();

		await trashNote( note, true )( dispatch );

		expect( comment.update ).toHaveBeenCalledWith( { status: 'trash' } );
		expect( comment.del ).not.toHaveBeenCalled();
		expect( dispatch ).toHaveBeenCalledWith( { type: 'TRASH_NOTE', noteId: 1 } );
	} );

	it( 'moves the comment to the trash instead of deleting it from the undo bar', () => {
		const item = new UndoListItem( {
			note,
			removeNotes: vi.fn(),
			global: { resetUndoBar: vi.fn() },
		} );

		item.deleteComment();

		expect( comment.update ).toHaveBeenCalledWith( { status: 'trash' }, expect.any( Function ) );
		expect( comment.del ).not.toHaveBeenCalled();
	} );
} );
