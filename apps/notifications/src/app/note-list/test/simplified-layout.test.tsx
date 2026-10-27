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
const SENTENCE = `Somebody liked your post ${ POST_TITLE }`;

const noteAboutAPost = () => ( {
	id: 1,
	type: 'like',
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
	meta: {
		summary: { text: 'Somebody liked your post', ranges: [] },
		post: { title: POST_TITLE, url: '', date: null, author_name: '' },
	},
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
		{ text: 'Checked them against the harbour office, you are right.', ranges: [], media: [] },
	],
	body: [],
	meta: {
		ids: { comment: 3, parent_comment: 2, reply_comment: 4 },
		summary: { text: 'Ben Quah replied to your comment', ranges: [] },
		post: { title: POST_TITLE, url: '', date: null, author_name: '' },
	},
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
			'Somebody liked your post'
		);
	} );

	// The setting is only offered where the flag is on. Somewhere it is off there is no
	// way back to detailed, so a preference saved elsewhere must not follow the account in.
	it( 'ignores a saved simplified layout where the setting is not offered', () => {
		const { container } = renderList( 'simplified', { isViewSettingsEnabled: false } );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent( SENTENCE );
		expect( screen.getByText( 'Nice post, really helpful!' ) ).toBeVisible();
	} );

	it( 'keeps the reply icon and previews the reply itself, not the comment it replied to', () => {
		const { container } = renderList( 'simplified', { note: replyNote() as never } );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent(
			'Ben Quah replied to your comment'
		);
		expect( container.querySelector( '.wpnc__subject .gridicons-reply' ) ).toBeInTheDocument();
		expect( container.querySelector( '.wpnc__excerpt' ) ).toHaveTextContent(
			'Checked them against the harbour office, you are right.'
		);
		expect( screen.queryByText( REPLY_TITLE ) ).not.toBeInTheDocument();
	} );

	it( 'previews the liked comment, not the post', () => {
		const note = noteAboutAPost();
		const { container } = renderList( 'simplified', {
			note: {
				...note,
				type: 'comment_like',
				meta: {
					...note.meta,
					parent_comment: {
						text: 'Proof it overnight in the fridge.',
						author_name: 'You',
						author_avatar: null,
						date: null,
						url: '',
					},
				},
			} as never,
		} );

		expect( container.querySelector( '.wpnc__excerpt' ) ).toHaveTextContent(
			'Proof it overnight in the fridge.'
		);
	} );

	it( 'does not render a link inside the row, so the whole row opens the note', () => {
		const domain = 'kettleandcrust.blog';
		const text = `Act now! ${ domain } expired`;
		const { container } = renderList( 'detailed', {
			note: {
				...noteAboutAPost(),
				type: 'expired_domain',
				subject: [
					{
						text,
						ranges: [
							{
								type: 'a',
								url: `https://${ domain }`,
								indices: [ text.indexOf( domain ), text.indexOf( domain ) + domain.length ],
							},
						],
						media: [],
					},
				],
				meta: {},
			} as never,
		} );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent( text );
		expect( screen.queryByRole( 'link', { name: domain } ) ).not.toBeInTheDocument();
	} );

	it( 'leads with the action, puts the post under it, and drops the excerpt', () => {
		const { container } = renderList( 'simplified' );

		expect( container.querySelector( '.wpnc__subject' ) ).toHaveTextContent(
			'Somebody liked your post'
		);
		expect( container.querySelector( '.wpnc__excerpt' ) ).toHaveTextContent( POST_TITLE );
		expect( screen.queryByText( SENTENCE ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Nice post, really helpful!' ) ).not.toBeInTheDocument();
	} );
} );
