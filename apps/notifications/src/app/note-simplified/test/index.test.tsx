/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import { AppProvider } from '../../context';
import SimplifiedNote from '../index';
import type { Block, Note } from '../../types';

const SITE = 10;
const POST = 20;

const text = ( value: string, extra: Partial< Block > = {} ): Block => ( {
	text: value,
	...extra,
} );

const person = ( name: string, id: number, extra: Partial< Block > = {} ): Block =>
	text( name, {
		type: 'user',
		ranges: [ { type: 'user', indices: [ 0, name.length ], id, parent: null } ],
		meta: { ids: { user: id }, links: { home: `https://${ id }.example` } },
		...extra,
	} );

const makeNote = ( note: Partial< Note > ): Note => ( {
	id: 1,
	type: 'comment',
	read: 1,
	noticon: '',
	timestamp: '2026-09-01T09:00:00+00:00',
	icon: '',
	url: 'https://site.example/post/',
	title: 'Note',
	note_hash: 1,
	subject: [ text( 'Someone did something' ) ],
	body: [],
	meta: { ids: { site: SITE, post: POST } },
	...note,
} );

const renderNote = ( note: Note ) =>
	render(
		<Provider store={ initStore() }>
			<AppProvider client={ null } locale="en">
				<SimplifiedNote note={ note } />
			</AppProvider>
		</Provider>
	);

describe( 'SimplifiedNote', () => {
	it( 'shows a reply under the comment it answers, each with its author', () => {
		renderNote(
			makeNote( {
				meta: { ids: { site: SITE, post: POST, comment: 31, parent_comment: 30 } },
				header: [ person( 'Steve', 1 ), text( 'The original comment' ) ],
				body: [
					person( 'Ben', 2 ),
					text( 'The reply', { meta: { ids: { site: SITE, post: POST, comment: 31 } } } ),
				],
			} )
		);

		expect( screen.getByText( 'The original comment' ) ).toBeInTheDocument();
		expect( screen.getByText( 'The reply' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Steve' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Ben' ) ).toBeInTheDocument();
	} );

	it( 'keeps the Subscribe link of the person who mentioned you in a post', () => {
		renderNote(
			makeNote( {
				type: 'automattcher',
				body: [
					person( 'Kwame', 3, {
						actions: { follow: false },
						meta: { ids: { user: 3, site: 30 }, links: { home: 'https://kwame.example' } },
					} ),
					text( 'and @you owns this' ),
				],
			} )
		);

		expect( screen.getByRole( 'button', { name: 'Subscribe' } ) ).toBeInTheDocument();
	} );

	it( 'opens a system note straight on its body, without repeating the subject', () => {
		renderNote(
			makeNote( {
				type: 'achievement',
				meta: { ids: {} },
				subject: [ text( 'Achievement unlocked: The Headliner' ) ],
				body: [ text( 'Change a post title five times before publishing it.' ) ],
			} )
		);

		expect( screen.getByText( /Change a post title/ ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Achievement unlocked: The Headliner' ) ).not.toBeInTheDocument();
	} );

	it( 'shows a new post’s own content rather than a card', () => {
		const { container } = renderNote(
			makeNote( {
				type: 'new_post',
				body: [
					text( '', {
						meta: { ids: { site: SITE, post: POST } },
						media: [ { type: 'image', indices: [ 0, 0 ], url: 'https://img.example/a.png' } ],
					} ),
				],
			} )
		);

		expect( container.querySelector( 'img[src="https://img.example/a.png"]' ) ).not.toBeNull();
	} );
} );
