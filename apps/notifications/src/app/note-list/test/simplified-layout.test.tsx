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
	body: [],
} );

const REPLY_TITLE = 'The tide tables are wrong';
const REPLY_SENTENCE = `Ben Quah replied to your comment ${ REPLY_TITLE }`;

// The API marks reply notes with a zero-width `noticon` range at the head of the
// subject, which `html()` turns into the inline reply gridicon.
const replyNote = () => ( {
	id: 2,
	type: 'comment',
	read: 0,
	noticon: '',
	timestamp: '2026-06-01T00:00:00+00:00',
	title: 'Reply title',
	subject: [
		{
			text: REPLY_SENTENCE,
			ranges: [
				{ type: 'noticon', value: '\uf467', indices: [ 0, 0 ], id: 2, parent: null },
				{
					type: 'comment',
					indices: [ REPLY_SENTENCE.indexOf( REPLY_TITLE ), REPLY_SENTENCE.length ],
					id: 2,
					parent: null,
				},
			],
			media: [],
		},
	],
	body: [],
} );

const renderList = (
	layoutStyle?: 'detailed' | 'simplified',
	{
		isViewSettingsEnabled = true,
		note = noteAboutAPost(),
	}: { isViewSettingsEnabled?: boolean; note?: ReturnType< typeof noteAboutAPost > } = {}
) => {
	const store = initStore();
	store.dispatch( actions.notes.addNotes( [ note ] ) );
	store.dispatch( actions.ui.loadedNotes() );

	if ( layoutStyle ) {
		store.dispatch( actions.ui.setLayoutStyle( layoutStyle ) );
	}

	return render(
		<Provider store={ store }>
			<AppProvider
				client={ client as never }
				locale="en"
				isViewSettingsEnabled={ isViewSettingsEnabled }
			>
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

	// The detailed subject is rendered through `html()`, which splits the sentence across
	// elements for its ranges, so assert on the row's text rather than a single node.
	it( 'shows the whole sentence and the excerpt on the detailed rows', () => {
		const { container } = renderList( 'detailed' );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent( SENTENCE );
		expect( screen.getByText( 'Nice post, really helpful!' ) ).toBeVisible();
	} );

	it( 'leads with the simplified rows when no layout has been chosen', () => {
		const { container } = renderList();

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent(
			'Ashar liked your comment'
		);
	} );

	// The setting is only offered where the flag is on. Somewhere it is off there is no
	// way back to detailed, so a preference saved elsewhere must not follow the account in.
	it( 'ignores a saved simplified layout where the setting is not offered', () => {
		const { container } = renderList( 'simplified', { isViewSettingsEnabled: false } );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent( SENTENCE );
		expect( screen.getByText( 'Nice post, really helpful!' ) ).toBeVisible();
	} );

	// The reply gridicon rides on a zero-width range, so slicing the sentence as plain
	// text silently drops it. It has to survive the switch to the simplified layout.
	it( 'keeps the reply icon when the action is simplified', () => {
		const { container } = renderList( 'simplified', { note: replyNote() as never } );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent(
			'Ben Quah replied to your comment'
		);
		expect( container.querySelector( '.wpnc__subject .gridicons-reply' ) ).toBeInTheDocument();
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
