/**
 * @jest-environment jsdom
 */
import { getClient, initClient } from '@automattic/notifications/src/app/client';
import { store } from '@automattic/notifications/src/panel/state';
import {
	acquireEngineVisibility,
	commitPendingUndoableAction,
	computeVisibleNotes,
	countUnreadNotes,
	editCommentContent,
	getAvailableNoteActions,
	getPendingUndoableAction,
	hasMoreNotesFor,
	loadMoreFor,
	normalizeNoteId,
	openNote,
	replyToNote,
	setActiveTab,
	setApprovalStatus,
	setFollowStatus,
	setLikeStatus,
	spamNote,
	trashNote,
	undoPendingAction,
} from '../engine';
import type { FilterName, Note } from '../engine';

jest.mock( 'calypso/lib/wp', () => ( { __esModule: true, default: {} } ) );

jest.mock( '@automattic/notifications/src/app/client', () => ( {
	getClient: jest.fn(),
	initClient: jest.fn(),
} ) );

jest.mock( '@automattic/notifications/src/panel/state', () => {
	const listeners = new Set< () => void >();
	return {
		store: {
			state: { allNotes: [] as unknown[] },
			getState() {
				return this.state;
			},
			dispatch: jest.fn(),
			subscribe( listener: () => void ) {
				listeners.add( listener );
				return () => listeners.delete( listener );
			},
			emit() {
				listeners.forEach( ( listener ) => listener() );
			},
		},
		init: jest.fn(),
	};
} );

jest.mock( '@automattic/notifications/src/panel/state/actions', () => ( {
	__esModule: true,
	default: {
		ui: {
			selectNote: ( noteId: number ) => ( { type: 'SELECT_NOTE', noteId } ),
			undoAction: ( noteId: number ) => ( { type: 'UNDO_ACTION', noteId } ),
		},
		notes: {
			removeNotes: ( noteIds: number[], isComment: boolean ) => ( {
				type: 'NOTES_REMOVE',
				noteIds,
				isComment,
			} ),
			approveNote: ( noteId: number, isApproved: boolean ) => ( {
				type: 'APPROVE_NOTE',
				noteId,
				isApproved,
			} ),
		},
	},
} ) );

jest.mock( '@automattic/notifications/src/panel/state/notes/thunks', () => ( {
	setApproveStatus: jest.fn( ( ...args: unknown[] ) => ( { thunk: 'approve', args } ) ),
	setLikeStatus: jest.fn( ( ...args: unknown[] ) => ( { thunk: 'like', args } ) ),
	spamNote: jest.fn( ( ...args: unknown[] ) => ( { thunk: 'spam', args } ) ),
	trashNote: jest.fn( ( ...args: unknown[] ) => ( { thunk: 'trash', args } ) ),
} ) );

jest.mock( '@automattic/notifications/src/panel/helpers/notes', () => ( {
	getActions: ( note: { body?: { actions?: object }[] } ) =>
		note.body?.filter( ( block ) => block.actions ).slice( -1 )[ 0 ]?.actions ?? {},
	getReferenceId: ( note: { meta?: { ids?: Record< string, number > } }, type: string ) =>
		note.meta?.ids?.[ type ] ?? null,
	getEditCommentLink: () => 'https://example.com/edit',
} ) );

jest.mock( '@automattic/notifications/src/panel/helpers/stats', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/notifications/src/panel/rest-client/bump-stat', () => ( {
	bumpStat: jest.fn(),
} ) );

const mockComment = {
	reply: jest.fn(),
	update: jest.fn(),
	del: jest.fn(),
	get: jest.fn(),
};
const mockPostComments = { add: jest.fn() };
const mockFollow = { add: jest.fn(), del: jest.fn() };
const mockWpcomApi = {
	site: () => ( {
		comment: () => mockComment,
		post: () => ( { comment: () => mockPostComments } ),
		follow: () => mockFollow,
	} ),
};
jest.mock( '@automattic/notifications/src/panel/rest-client/wpcom', () => ( {
	wpcom: () => mockWpcomApi,
} ) );

jest.mock( '@automattic/notifications/src/panel/state/selectors/get-is-note-approved', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( '@automattic/notifications/src/panel/state/selectors/get-is-note-liked', () => ( {
	__esModule: true,
	default: () => false,
} ) );

jest.mock( '@automattic/notifications/src/panel/state/selectors/get-all-notes', () => ( {
	__esModule: true,
	default: ( state: { allNotes: unknown[] } ) => state.allNotes,
} ) );
jest.mock( '@automattic/notifications/src/panel/state/selectors/get-filtered-note-ids', () => ( {
	__esModule: true,
	default: () => undefined,
} ) );
jest.mock( '@automattic/notifications/src/panel/state/selectors/get-hidden-note-ids', () => ( {
	__esModule: true,
	default: () => ( {} ),
} ) );
jest.mock( '@automattic/notifications/src/panel/state/selectors/get-is-loading', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( '@automattic/notifications/src/panel/state/selectors/get-filtered-loading', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '@automattic/notifications/src/panel/state/selectors/get-is-note-read', () => ( {
	__esModule: true,
	default: ( state: unknown, note: { read: number } ) => !! note.read,
} ) );
jest.mock( '@automattic/notifications/src/panel/templates/filters', () => ( {
	getFilters: () => ( {
		all: { name: 'all', filter: () => true },
		unread: { name: 'unread', filter: ( note: { read: number } ) => ! note.read },
	} ),
} ) );

const mockGetClient = getClient as jest.Mock;
const mockInitClient = initClient as jest.Mock;
const mockStore = store as unknown as {
	state: { allNotes: unknown[] };
	dispatch: jest.Mock;
	emit: () => void;
};

const makeNote = ( id: number, extra: Partial< Note > = {} ): Note =>
	( { id, type: 'comment', read: 0, timestamp: '2026-08-24T00:00:00+00:00', ...extra } ) as Note;

const makeClient = () => ( {
	setFilter: jest.fn(),
	loadMore: jest.fn(),
	hasMoreNotes: jest.fn( () => true ),
	setVisibility: jest.fn(),
	getNote: jest.fn(),
} );

beforeEach( () => {
	jest.clearAllMocks();
	mockStore.state = { allNotes: [] };
	setActiveTab( 'all' );
} );

describe( 'normalizeNoteId', () => {
	it( 'accepts numbers and numeric strings', () => {
		expect( normalizeNoteId( 123 ) ).toBe( 123 );
		expect( normalizeNoteId( '123' ) ).toBe( 123 );
	} );

	it( 'rejects garbage', () => {
		expect( normalizeNoteId( 'abc' ) ).toBeNull();
		expect( normalizeNoteId( '' ) ).toBeNull();
		expect( normalizeNoteId( undefined ) ).toBeNull();
		expect( normalizeNoteId( -1 ) ).toBeNull();
		expect( normalizeNoteId( 1.5 ) ).toBeNull();
	} );
} );

describe( 'loadMoreFor', () => {
	it( 're-asserts the filter before loading more', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		loadMoreFor( 'unread' );

		expect( client.setFilter ).toHaveBeenCalledWith( 'unread' );
		expect( client.loadMore ).toHaveBeenCalled();
		expect( client.setFilter.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			client.loadMore.mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'is a no-op without a client', () => {
		mockGetClient.mockReturnValue( undefined );
		expect( () => loadMoreFor( 'all' ) ).not.toThrow();
	} );
} );

describe( 'hasMoreNotesFor', () => {
	it( 'passes the explicit tab', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		expect( hasMoreNotesFor( 'unread' ) ).toBe( true );
		expect( client.hasMoreNotes ).toHaveBeenCalledWith( 'unread' );
	} );

	it( 'reports false without a client', () => {
		mockGetClient.mockReturnValue( undefined );
		expect( hasMoreNotesFor( 'all' ) ).toBe( false );
	} );
} );

describe( 'openNote', () => {
	it( 'selects immediately when the note is loaded, without refetching', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );
		mockStore.state = { allNotes: [ makeNote( 42 ) ] };

		openNote( '42' );

		expect( mockStore.dispatch ).toHaveBeenCalledWith( { type: 'SELECT_NOTE', noteId: 42 } );
		expect( client.getNote ).not.toHaveBeenCalled();
	} );

	it( 'fetches a missing note and selects it once it lands', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		openNote( 42 );

		expect( client.getNote ).toHaveBeenCalledWith( 42 );
		expect( mockStore.dispatch ).not.toHaveBeenCalled();

		mockStore.state = { allNotes: [ makeNote( 42 ) ] };
		mockStore.emit();

		expect( mockStore.dispatch ).toHaveBeenCalledWith( { type: 'SELECT_NOTE', noteId: 42 } );

		mockStore.emit();
		expect( mockStore.dispatch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'cancel prevents a late selection', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		const cancel = openNote( 42 );
		cancel();

		mockStore.state = { allNotes: [ makeNote( 42 ) ] };
		mockStore.emit();

		expect( mockStore.dispatch ).not.toHaveBeenCalled();
	} );

	it( 'ignores invalid ids', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		openNote( 'not-a-number' );

		expect( client.getNote ).not.toHaveBeenCalled();
		expect( mockStore.dispatch ).not.toHaveBeenCalled();
	} );
} );

describe( 'acquireEngineVisibility', () => {
	it( 'boots the engine and declares the inbox showing', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		acquireEngineVisibility();

		expect( mockInitClient ).toHaveBeenCalled();
		expect( client.setVisibility ).toHaveBeenCalledWith( { isShowing: true, isVisible: true } );
	} );

	it( 're-asserts visibility and the active tab on window focus', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		setActiveTab( 'unread' );
		const release = acquireEngineVisibility();
		client.setVisibility.mockClear();
		client.setFilter.mockClear();

		window.dispatchEvent( new Event( 'focus' ) );

		expect( client.setVisibility ).toHaveBeenCalledWith( { isShowing: true, isVisible: true } );
		expect( client.setFilter ).toHaveBeenCalledWith( 'unread' );

		release();
	} );

	it( 'release drops isShowing and stops listening', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		const release = acquireEngineVisibility();
		client.setVisibility.mockClear();

		release();

		expect( client.setVisibility ).toHaveBeenCalledWith( { isShowing: false, isVisible: true } );

		client.setVisibility.mockClear();
		window.dispatchEvent( new Event( 'focus' ) );
		expect( client.setVisibility ).not.toHaveBeenCalled();
	} );
} );

describe( 'setActiveTab', () => {
	it( 'pushes the tab to the client', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		setActiveTab( 'comments' );

		expect( client.setFilter ).toHaveBeenCalledWith( 'comments' );
	} );

	it( 'tolerates the engine not being booted yet', () => {
		mockGetClient.mockReturnValue( undefined );
		expect( () => setActiveTab( 'likes' ) ).not.toThrow();
	} );
} );

describe( 'countUnreadNotes', () => {
	const isUnread = ( note: Note ) => ! note.read;

	it( 'counts unread notes, skipping hidden ones', () => {
		const notes = [ makeNote( 1 ), makeNote( 2, { read: 1 } ), makeNote( 3 ), makeNote( 4 ) ];
		expect( countUnreadNotes( notes, {}, isUnread ) ).toBe( 3 );
		expect( countUnreadNotes( notes, { 3: true }, isUnread ) ).toBe( 2 );
	} );

	it( 'returns 0 for an empty store', () => {
		expect( countUnreadNotes( [], {}, isUnread ) ).toBe( 0 );
	} );
} );

describe( 'computeVisibleNotes', () => {
	const matchesAll = () => true;
	const notes = [ makeNote( 1 ), makeNote( 2, { read: 1 } ), makeNote( 3 ) ];

	it( 'renders the whole store on the All tab', () => {
		const result = computeVisibleNotes( 'all', notes, undefined, {}, false, null, matchesAll );
		expect( result.notes ).toEqual( notes );
		expect( result.hasInitiallyLoaded ).toBe( true );
	} );

	it( 'renders the cached id list for a filtered tab, in server order', () => {
		const result = computeVisibleNotes(
			'unread',
			notes,
			[ 3, 1, 99 ],
			{},
			false,
			null,
			( note: Note ) => ! note.read
		);
		expect( result.notes.map( ( note ) => note.id ) ).toEqual( [ 3, 1 ] );
	} );

	it( 'applies the client predicate on top of the cached list', () => {
		const result = computeVisibleNotes(
			'unread',
			notes,
			[ 1, 2 ],
			{},
			false,
			null,
			( note: Note ) => ! note.read
		);
		expect( result.notes.map( ( note ) => note.id ) ).toEqual( [ 1 ] );
	} );

	it( 'drops hidden (just trashed/spammed) notes', () => {
		const result = computeVisibleNotes(
			'all',
			notes,
			undefined,
			{ 2: true },
			false,
			null,
			matchesAll
		);
		expect( result.notes.map( ( note ) => note.id ) ).toEqual( [ 1, 3 ] );
	} );

	it( 'scopes loading to the tab', () => {
		const all = ( isLoading: boolean, filteredLoading: string | null ) =>
			computeVisibleNotes( 'all', [], undefined, {}, isLoading, filteredLoading, matchesAll );
		const unread = ( filteredLoading: string | null, ids?: number[] ) =>
			computeVisibleNotes( 'unread', [], ids, {}, false, filteredLoading, matchesAll );

		expect( all( true, null ).isLoading ).toBe( true );
		expect( all( true, 'unread' ).isLoading ).toBe( false );
		expect( unread( 'unread' ).isLoading ).toBe( true );
		expect( unread( 'comments' as FilterName ).isLoading ).toBe( false );
		expect( unread( null ).hasInitiallyLoaded ).toBe( false );
		expect( unread( null, [] ).hasInitiallyLoaded ).toBe( true );
	} );
} );

const makeCommentNote = ( extra: Partial< Note > = {} ): Note =>
	makeNote( 42, {
		type: 'comment',
		meta: { ids: { site: 7, post: 5, comment: 9 } },
		...extra,
	} as Partial< Note > );

describe( 'getAvailableNoteActions', () => {
	it( 'maps the payload action keys from the last actions block', () => {
		const note = makeCommentNote( {
			body: [
				{ text: 'ignored' },
				{
					text: '',
					actions: {
						'replyto-comment': true,
						'approve-comment': false,
						'like-comment': true,
						'spam-comment': true,
						'trash-comment': true,
						'edit-comment': true,
						'answer-prompt': 'https://example.com/prompt',
					},
				},
			] as Note[ 'body' ],
		} );

		expect( getAvailableNoteActions( note ) ).toEqual( {
			replyToComment: true,
			likePost: false,
			likeComment: true,
			approveComment: true,
			spamComment: true,
			trashComment: true,
			editComment: true,
			answerPromptHref: 'https://example.com/prompt',
			follow: null,
		} );
	} );

	it( 'derives follow from a user block on non-comment notes only', () => {
		const body = [
			{ text: '', meta: { ids: { site: 77 } }, actions: { follow: false } },
		] as Note[ 'body' ];

		const followNote = makeNote( 1, { type: 'follow', body } );
		expect( getAvailableNoteActions( followNote ).follow ).toEqual( {
			siteId: 77,
			isFollowing: false,
		} );

		const commentNote = makeNote( 2, { type: 'comment', body } );
		expect( getAvailableNoteActions( commentNote ).follow ).toBeNull();
	} );
} );

describe( 'approval and like dispatchers', () => {
	it( 'dispatches the approve thunk with the mirrored legacy args', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		setApprovalStatus( makeCommentNote(), true );

		expect( mockStore.dispatch ).toHaveBeenCalledWith( {
			thunk: 'approve',
			args: [ 42, 7, 9, true, 'comment', client ],
		} );
	} );

	it( 'dispatches the like thunk with the mirrored legacy args', () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );

		setLikeStatus( makeCommentNote(), true );

		expect( mockStore.dispatch ).toHaveBeenCalledWith( {
			thunk: 'like',
			args: [ 42, 7, 5, 9, true, client ],
		} );
	} );
} );

describe( 'spam/trash with undo', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		mockComment.del.mockReset();
		mockComment.get.mockReset();
		mockComment.update.mockReset();
	} );

	afterEach( () => {
		// Drain any pending action so state never leaks across tests.
		undoPendingAction();
		jest.useRealTimers();
	} );

	it( 'dispatches the thunks undo-first and installs the undo bridge', () => {
		const client = makeClient() as ReturnType< typeof makeClient > & { global?: unknown };
		mockGetClient.mockReturnValue( client );

		const note = makeCommentNote();
		spamNote( note );
		trashNote( note );

		expect( mockStore.dispatch ).toHaveBeenCalledWith( {
			thunk: 'spam',
			args: [ note, false, client ],
		} );
		expect( mockStore.dispatch ).toHaveBeenCalledWith( {
			thunk: 'trash',
			args: [ note, false, client ],
		} );
		expect( client.global ).toMatchObject( {
			updateUndoBar: expect.any( Function ),
			resetUndoBar: expect.any( Function ),
		} );
	} );

	const armPending = ( kind: 'spam' | 'trash', note: Note ) => {
		const client = makeClient() as ReturnType< typeof makeClient > & {
			global?: { updateUndoBar: ( kind: string, note: Note ) => void };
		};
		mockGetClient.mockReturnValue( client );
		spamNote( note );
		client.global?.updateUndoBar( kind, note );
		return client;
	};

	it( 'undo cancels the pending action and dispatches UNDO_ACTION', () => {
		const note = makeCommentNote();
		armPending( 'trash', note );
		expect( getPendingUndoableAction() ).toEqual( { kind: 'trash', note } );

		undoPendingAction();

		expect( mockStore.dispatch ).toHaveBeenCalledWith( { type: 'UNDO_ACTION', noteId: 42 } );
		expect( getPendingUndoableAction() ).toBeNull();
		jest.runAllTimers();
		expect( mockComment.del ).not.toHaveBeenCalled();
	} );

	it( 'commit executes a trash immediately and removes the note', () => {
		const note = makeCommentNote();
		armPending( 'trash', note );

		commitPendingUndoableAction();

		expect( mockComment.del ).toHaveBeenCalled();
		expect( mockStore.dispatch ).toHaveBeenCalledWith( {
			type: 'NOTES_REMOVE',
			noteIds: [ 42 ],
			isComment: true,
		} );
		expect( getPendingUndoableAction() ).toBeNull();
	} );

	it( 'a spam executes after the grace period via get-then-update', () => {
		const note = makeCommentNote();
		armPending( 'spam', note );

		jest.advanceTimersByTime( 4500 );

		expect( mockComment.get ).toHaveBeenCalled();
		const getCallback = mockComment.get.mock.calls[ 0 ][ 0 ];
		getCallback( null, { status: 'approved' } );
		expect( mockComment.update ).toHaveBeenCalledWith(
			expect.objectContaining( { status: 'spam' } ),
			expect.any( Function )
		);
		expect( getPendingUndoableAction() ).toBeNull();
	} );
} );

describe( 'replyToNote', () => {
	it( 'replies to the comment, pre-approves it, and refetches the note', async () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );
		mockComment.reply.mockImplementation( ( text: string, cb: ( e: null ) => void ) => cb( null ) );

		await replyToNote( makeCommentNote(), 'hello' );

		expect( mockComment.reply ).toHaveBeenCalledWith( 'hello', expect.any( Function ) );
		expect( mockStore.dispatch ).toHaveBeenCalledWith( {
			type: 'APPROVE_NOTE',
			noteId: 42,
			isApproved: true,
		} );
		expect( client.getNote ).toHaveBeenCalledWith( 42 );
	} );

	it( 'replies to the post when the note has no comment', async () => {
		mockGetClient.mockReturnValue( makeClient() );
		mockPostComments.add.mockImplementation( ( text: string, cb: ( e: null ) => void ) =>
			cb( null )
		);

		await replyToNote(
			makeNote( 42, { type: 'new_post', meta: { ids: { site: 7, post: 5 } } } ),
			'hello'
		);

		expect( mockPostComments.add ).toHaveBeenCalledWith( 'hello', expect.any( Function ) );
	} );

	it( 'rejects on submission error', async () => {
		mockGetClient.mockReturnValue( makeClient() );
		mockComment.reply.mockImplementation( ( text: string, cb: ( e: Error ) => void ) =>
			cb( new Error( 'nope' ) )
		);

		await expect( replyToNote( makeCommentNote(), 'hello' ) ).rejects.toThrow( 'nope' );
	} );
} );

describe( 'editCommentContent', () => {
	it( 'updates the comment content and refetches the note', async () => {
		const client = makeClient();
		mockGetClient.mockReturnValue( client );
		mockComment.update.mockImplementation( ( data: object, cb: ( e: null ) => void ) =>
			cb( null )
		);

		await editCommentContent( makeCommentNote(), 'edited' );

		expect( mockComment.update ).toHaveBeenCalledWith(
			{ content: 'edited' },
			expect.any( Function )
		);
		expect( client.getNote ).toHaveBeenCalledWith( 42 );
	} );

	it( 'rejects when the note has no comment', async () => {
		await expect(
			editCommentContent( makeNote( 1, { meta: { ids: { site: 7 } } } ), 'x' )
		).rejects.toThrow( 'no comment' );
	} );
} );

describe( 'setFollowStatus', () => {
	it( 'follows and resolves with the server state', async () => {
		mockFollow.add.mockImplementation( ( cb: ( e: null, d: object ) => void ) =>
			cb( null, { is_following: true } )
		);

		await expect( setFollowStatus( makeNote( 1, { type: 'follow' } ), 77, true ) ).resolves.toBe(
			true
		);
		expect( mockFollow.add ).toHaveBeenCalled();
	} );

	it( 'unfollows via del', async () => {
		mockFollow.del.mockImplementation( ( cb: ( e: null, d: object ) => void ) =>
			cb( null, { is_following: false } )
		);

		await expect( setFollowStatus( makeNote( 1, { type: 'follow' } ), 77, false ) ).resolves.toBe(
			false
		);
		expect( mockFollow.del ).toHaveBeenCalled();
	} );
} );
