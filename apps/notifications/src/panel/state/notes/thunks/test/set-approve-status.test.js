/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { reportRequestError } from '../../../../helpers/log-error';
import { init as initWpcom } from '../../../../rest-client/wpcom';
import { store, init as initState } from '../../../../state';
import actions from '../../../actions';
import getIsNoteApproved from '../../../selectors/get-is-note-approved';
import setApproveStatus from '../set-approve-status';

vi.mock( '../../../../helpers/log-error', () => ( {
	reportError: vi.fn(),
	reportRequestError: vi.fn(),
} ) );

const note = {
	id: 5,
	type: 'comment',
	read: 1,
	timestamp: '2026-06-01T00:00:00.000Z',
	subject: [ { text: 'note 5' } ],
	body: [ { type: 'comment', actions: { 'approve-comment': false } } ],
	note_hash: 'hash-5',
};

describe( 'setApproveStatus', () => {
	let updates;
	let restClient;

	beforeEach( () => {
		window._tkq = [];
		vi.mocked( reportRequestError ).mockClear();
		// The redux store is a shared singleton; re-init it so each test starts empty.
		initState();

		updates = [];
		initWpcom( {
			site: ( siteId ) => ( {
				comment: ( commentId ) => ( {
					update: ( body, callback ) => updates.push( { siteId, commentId, body, callback } ),
				} ),
			} ),
		} );
		restClient = { getNote: vi.fn() };

		store.dispatch( actions.notes.addNotes( [ note ] ) );
	} );

	it( 'shows the change at once and settles once the server has answered', async () => {
		let isSettled = false;

		const update = store.dispatch(
			setApproveStatus( note.id, 10, 20, true, note.type, restClient )
		);
		update.then( () => ( isSettled = true ) );

		expect( getIsNoteApproved( store.getState(), note ) ).toBe( true );
		expect( updates ).toEqual( [
			expect.objectContaining( { siteId: 10, commentId: 20, body: { status: 'approved' } } ),
		] );
		await Promise.resolve();
		expect( isSettled ).toBe( false );

		updates[ 0 ].callback( null );
		await update;

		expect( restClient.getNote ).toHaveBeenCalledWith( note.id );
	} );

	it( 'settles when the request fails too', async () => {
		const update = store.dispatch(
			setApproveStatus( note.id, 10, 20, false, note.type, restClient )
		);

		updates[ 0 ].callback( { status: 500 } );
		await update;

		expect( reportRequestError ).toHaveBeenCalledWith( 'approve', { status: 500 } );
		expect( restClient.getNote ).toHaveBeenCalledWith( note.id );
	} );
} );
