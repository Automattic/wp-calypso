/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import NoteList from '../index';

const noop = () => {};
const client = { hasMoreNotes: () => false, loadMore: noop, setFilter: noop };

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

const OpenableNoteList = ( { openNoteOnArrowKeys }: { openNoteOnArrowKeys?: boolean } ) => {
	const [ selectedNoteId, setSelectedNoteId ] = useState< string >();
	return (
		<>
			<NoteList
				filterName="all"
				selectedNoteId={ selectedNoteId }
				setSelectedNoteId={ setSelectedNoteId }
				openNoteOnArrowKeys={ openNoteOnArrowKeys }
			/>
			<output aria-label="Open note">{ selectedNoteId ?? 'none' }</output>
		</>
	);
};

const renderNoteList = ( props: { openNoteOnArrowKeys?: boolean } = {} ) => {
	const store = initStore();
	// Newest first: 803, 802, 801.
	store.dispatch(
		actions.notes.addNotes( [
			makeNote( 801, 'First comment' ),
			makeNote( 802, 'Second comment' ),
			makeNote( 803, 'Third comment' ),
		] )
	);
	store.dispatch( actions.ui.loadedNotes() );

	return render(
		<Provider store={ store }>
			<AppProvider client={ client as never } locale="en">
				<OpenableNoteList { ...props } />
			</AppProvider>
		</Provider>
	);
};

const openNote = () => screen.getByRole( 'status', { name: 'Open note' } );

describe( 'NoteList arrow keys', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = noop;
	} );

	it( 'opens the note an arrow key moves to when the host asks for it', async () => {
		const user = userEvent.setup();
		renderNoteList( { openNoteOnArrowKeys: true } );

		await user.click( screen.getByRole( 'button', { name: 'Third comment' } ) );
		expect( openNote() ).toHaveTextContent( '803' );

		await user.keyboard( '{ArrowDown}' );
		expect( openNote() ).toHaveTextContent( '802' );

		await user.keyboard( '{ArrowDown}' );
		expect( openNote() ).toHaveTextContent( '801' );

		await user.keyboard( '{ArrowUp}' );
		expect( openNote() ).toHaveTextContent( '802' );
	} );

	it( 'leaves the open note alone on arrow keys by default', async () => {
		const user = userEvent.setup();
		renderNoteList();

		await user.click( screen.getByRole( 'button', { name: 'Third comment' } ) );
		await user.keyboard( '{ArrowDown}' );

		expect( openNote() ).toHaveTextContent( '803' );
	} );

	it( 'opens a clicked note and keeps it open after an arrow key that could not move', async () => {
		const user = userEvent.setup();
		renderNoteList( { openNoteOnArrowKeys: true } );

		await user.click( screen.getByRole( 'button', { name: 'Third comment' } ) );
		await user.keyboard( '{ArrowUp}' );
		expect( openNote() ).toHaveTextContent( '803' );

		await user.click( screen.getByRole( 'button', { name: 'First comment' } ) );

		expect( openNote() ).toHaveTextContent( '801' );
	} );
} );
