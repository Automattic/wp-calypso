/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import { AppProvider } from '../../context';
import SimplifiedNote from '../index';
import { getTemporaryNoteTitle } from '../labels';
import type { Note, NoteParentComment } from '../../types';

const comment = ( extra: Partial< NoteParentComment > = {} ): NoteParentComment => ( {
	text: 'A comment',
	author_name: 'Mia Chen',
	author_avatar: null,
	date: null,
	url: 'https://site.example/post/#comment-1',
	...extra,
} );

const reply = ( id: number, extra: Partial< Note > = {} ) =>
	( {
		id,
		type: 'comment',
		read: 1,
		noticon: '',
		timestamp: '2026-09-01T09:00:00+00:00',
		icon: '',
		url: 'https://site.example/post/',
		title: 'Note',
		note_hash: id,
		subject: [ { text: 'Someone replied' } ],
		body: [ { text: 'The reply' } ],
		meta: {
			ids: { site: 10, post: 20, comment: id, parent_comment: 1 },
			parent_comment: comment(),
			actor: { name: 'Ben', avatar: '' },
		},
		...extra,
	} ) as Note;

const panel = ( note: Note ) => (
	<Provider store={ initStore() }>
		<AppProvider client={ null } locale="en">
			<SimplifiedNote note={ note } />
		</AppProvider>
	</Provider>
);

describe( 'ThreadParent', () => {
	it( 'tells screen readers which comment the reply answers', () => {
		render( panel( reply( 2 ) ) );

		expect( screen.getByText( 'In reply to Mia Chen' ) ).toBeInTheDocument();
	} );

	it( 'quotes a liked comment', () => {
		const { container } = render(
			panel(
				reply( 4, {
					type: 'comment_like',
					body: [],
					meta: {
						ids: { site: 10, post: 20 },
						parent_comment: comment(),
						actor_count: 2,
					},
				} )
			)
		);

		expect( container.querySelector( '.wpnc-simplified__thread-parent.is-compact' ) ).toBeTruthy();
		expect( screen.queryByText( /In reply to/ ) ).not.toBeInTheDocument();
	} );
} );

describe( 'getTemporaryNoteTitle', () => {
	it( 'counts the likes on a comment or a post', () => {
		const meta = { actor_count: 5 } as Note[ 'meta' ];

		expect( getTemporaryNoteTitle( reply( 5, { type: 'comment_like', meta } ) ) ).toBe(
			'5 likes on your comment'
		);
		expect( getTemporaryNoteTitle( reply( 6, { type: 'like', meta } ) ) ).toBe(
			'5 likes on your post'
		);
	} );
} );
