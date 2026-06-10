/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import NoteList from '../index';
import type { FilterName } from '../../types';

const noop = () => {};

// A client stub: NoteList only calls `hasMoreNotes()`/`loadMore()` on it.
const client = { hasMoreNotes: () => false, loadMore: noop };

const makeNote = ( id: number, label: string ) => ( {
	id,
	type: 'comment',
	read: true,
	timestamp: `2026-06-0${ id }T00:00:00+00:00`,
	icon: `https://example.com/avatar-${ id }.png`,
	noticon: '',
	title: `${ label } title`,
	subject: [ { text: label, ranges: [], media: [] } ],
} );

// Renders the list against a seeded store and exposes a button that flips the
// selection — the same prop change a click produces in the real app.
const Harness = () => {
	const [ store ] = useState( () => {
		const s = initStore();
		s.dispatch( actions.notes.addNotes( [ makeNote( 1, 'First' ), makeNote( 2, 'Second' ) ] ) );
		s.dispatch( actions.ui.loadedNotes() );
		return s;
	} );
	const [ selectedNoteId, setSelectedNoteId ] = useState< string | undefined >( undefined );

	return (
		<Provider store={ store }>
			<AppProvider client={ client as never } locale="en">
				<button onClick={ () => setSelectedNoteId( '1' ) }>select</button>
				<NoteList
					filterName={ 'all' as FilterName }
					selectedNoteId={ selectedNoteId }
					setSelectedNoteId={ setSelectedNoteId }
				/>
			</AppProvider>
		</Provider>
	);
};

const getAvatars = ( container: HTMLElement ) =>
	Array.from( container.querySelectorAll< HTMLImageElement >( '.wpnc__note-icon img' ) );

describe( 'NoteList', () => {
	beforeAll( () => {
		// jsdom doesn't implement scrollIntoView, which DataViews calls when a
		// list item becomes selected.
		Element.prototype.scrollIntoView = noop;
	} );

	it( 'keeps avatar image nodes mounted across a selection re-render', async () => {
		const user = userEvent.setup();
		const { container } = render( <Harness /> );

		const before = getAvatars( container );
		expect( before.length ).toBeGreaterThan( 0 );

		await act( () => user.click( screen.getByRole( 'button', { name: 'select' } ) ) );

		const after = getAvatars( container );
		expect( after.length ).toBe( before.length );

		// Same DOM nodes, not recreated ones. Recreating them is what re-requests
		// the images and makes them flash (DOTMSD-1262).
		after.forEach( ( node, i ) => expect( node ).toBe( before[ i ] ) );
	} );
} );
