/**
 * @jest-environment jsdom
 */
import { getClient, initClient } from '@automattic/notifications/src/app/client';
import { store } from '@automattic/notifications/src/panel/state';
import {
	acquireEngineVisibility,
	computeVisibleNotes,
	hasMoreNotesFor,
	loadMoreFor,
	normalizeNoteId,
	openNote,
	setActiveTab,
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
		},
	},
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
