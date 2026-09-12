/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import actions from '../../../panel/state/actions';
import { AppProvider } from '../../context';
import NoteList from '../index';
import type { FilterName } from '../../types';

const noop = () => {};
const client = { hasMoreNotes: () => false, loadMore: noop, setFilter: noop };

const POST_TITLE = 'An intro to widgets';
const SENTENCE = `Ashar liked your comment on ${ POST_TITLE }`;

const noteAboutAPost = () => ( {
	id: 1,
	type: 'comment',
	read: 0,
	noticon: '',
	timestamp: '2026-06-01T00:00:00+00:00',
	title: 'Comment title',
	subject: [
		{
			text: SENTENCE,
			ranges: [
				{
					type: 'post',
					indices: [ SENTENCE.indexOf( POST_TITLE ), SENTENCE.length ],
					id: 1,
					parent: null,
				},
			],
			media: [],
		},
		{ text: 'Nice post, really helpful!', ranges: [], media: [] },
	],
} );

const renderList = ( layoutStyle?: 'classic' | 'simplified' ) => {
	const store = initStore();
	store.dispatch( actions.notes.addNotes( [ noteAboutAPost() ] ) );
	store.dispatch( actions.ui.loadedNotes() );

	if ( layoutStyle ) {
		store.dispatch( actions.ui.setLayoutStyle( layoutStyle ) );
	}

	return render(
		<Provider store={ store }>
			<AppProvider client={ client as never } locale="en">
				<NoteList
					filterName={ 'all' as FilterName }
					selectedNoteId={ undefined }
					setSelectedNoteId={ noop }
				/>
			</AppProvider>
		</Provider>
	);
};

describe( 'NoteList simplified layout', () => {
	beforeAll( () => {
		Element.prototype.scrollIntoView = noop;
	} );

	// The classic subject is rendered through `html()`, which splits the sentence across
	// elements for its ranges, so assert on the row's text rather than a single node.
	it( 'shows the whole sentence and the excerpt by default', () => {
		const { container } = renderList();

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent( SENTENCE );
		expect( screen.getByText( 'Nice post, really helpful!' ) ).toBeVisible();
	} );

	it( 'leads with the action, puts the post under it, and drops the excerpt', () => {
		const { container } = renderList( 'simplified' );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent(
			'Ashar liked your comment'
		);
		expect( container.querySelector( '.wpnc__excerpt' ) ).toHaveTextContent( POST_TITLE );
		expect( screen.queryByText( SENTENCE ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Nice post, really helpful!' ) ).not.toBeInTheDocument();
	} );
} );
