/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import Client from '../../../panel/rest-client';
import { init as initWpcom } from '../../../panel/rest-client/wpcom';
import { init as initStore } from '../../../panel/state';
import getFilteredNoteIds from '../../../panel/state/selectors/get-filtered-note-ids';
import { AppProvider } from '../../context';
import NoteList from '../index';
import type { FilterName } from '../../types';

const noop = () => {};

// Valid, monotonic timestamps (higher id = newer note).
const makeNote = ( id: number, label: string, type = 'comment' ) => ( {
	id,
	type,
	read: 0,
	noticon: '',
	timestamp: new Date( Date.UTC( 2026, 5, 1, 0, 0, id ) ).toISOString(),
	title: `${ label } title`,
	subject: [ { text: label, ranges: [], media: [] } ],
} );

const page = ( ids: number[] ) => ids.map( ( id ) => makeNote( id, `note ${ id }` ) );

describe( 'load-more after a tab switch (integration)', () => {
	let getCalls: Array< {
		query: Record< string, unknown >;
		callback: ( e: unknown, d: unknown ) => void;
	} >;
	let client: Client;
	let store: ReturnType< typeof initStore >;

	beforeAll( () => {
		Element.prototype.scrollIntoView = noop;
	} );

	beforeEach( () => {
		jest.useFakeTimers();
		store = initStore();
		getCalls = [];
		initWpcom( {
			req: {
				get: ( _path: string, query: Record< string, unknown >, callback: never ) =>
					getCalls.push( { query, callback } ),
				post: noop,
			},
			pinghub: { connect: noop },
		} as never );
		client = new Client();
		client.isVisible = true;
		getCalls.length = 0;
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
	} );

	const list = ( filterName: FilterName ) => (
		<Provider store={ store }>
			<AppProvider client={ client as never } locale="en">
				{ /* Key by filterName so a switch remounts the list, like the real panel. */ }
				<NoteList
					key={ filterName }
					filterName={ filterName }
					selectedNoteId={ undefined }
					setSelectedNoteId={ noop }
				/>
			</AppProvider>
		</Provider>
	);

	const unreadCall = () => getCalls.find( ( c ) => c.query.unread );

	// The reported bug: 16 comments, first 10 shown, load more in flight, switch
	// away and back — the next 6 were fetched but dropped, so they never appeared.
	it( 'stores and shows notes whose load-more lands after switching away and back', () => {
		const { rerender } = render( list( 'unread' as FilterName ) );

		// First page: 10 of 16 (ids 116..107, a full page ⇒ more to come).
		act( () => {
			unreadCall()!.callback( null, {
				notes: page( [ 116, 115, 114, 113, 112, 111, 110, 109, 108, 107 ] ),
				last_seen_time: 0,
			} );
		} );
		expect( screen.getByText( 'note 116' ) ).toBeVisible();

		// The list auto-pages to fill its window: a load-more (with `before`) is now
		// in flight for the remaining notes.
		const loadMore = getCalls.find( ( c ) => c.query.unread && c.query.before );
		expect( loadMore ).toBeTruthy();

		// Switch away and back while that request is in flight.
		act( () => {
			rerender( list( 'comments' as FilterName ) );
		} );
		act( () => {
			rerender( list( 'unread' as FilterName ) );
		} );

		// The load-more response lands (the final 6: ids 106..101).
		act( () => {
			loadMore!.callback( null, {
				notes: page( [ 106, 105, 104, 103, 102, 101 ] ),
				last_seen_time: 0,
			} );
		} );

		// All 16 are stored for the Unread tab…
		expect( getFilteredNoteIds( store.getState(), 'unread' ) ).toHaveLength( 16 );
		// …and a note from the previously-dropped page is on screen.
		expect( screen.getAllByText( 'note 101' ).length ).toBeGreaterThan( 0 );
	} );
} );
