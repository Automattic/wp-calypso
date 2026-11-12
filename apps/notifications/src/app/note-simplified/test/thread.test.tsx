/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { init as initStore } from '../../../panel/state';
import { AppProvider } from '../../context';
import SimplifiedNote from '../index';
import { ThreadParent } from '../parts/thread';
import type { Note, NoteParentComment } from '../../types';

const comment = ( extra: Partial< NoteParentComment > = {} ): NoteParentComment => ( {
	text: 'The first paragraph of a long comment…',
	author_name: 'Mia Chen',
	author_avatar: null,
	date: null,
	url: 'https://site.example/post/#comment-1',
	content: { text: 'The first paragraph of a long comment.\nThe second paragraph.' },
	...extra,
} );

// jsdom doesn't lay out text, so stand in for a clamp that hides some of it.
const clampHidesText = ( hides: boolean ) => {
	jest.spyOn( HTMLElement.prototype, 'scrollHeight', 'get' ).mockReturnValue( hides ? 60 : 40 );
	jest.spyOn( HTMLElement.prototype, 'clientHeight', 'get' ).mockReturnValue( 40 );
};

beforeAll( () => {
	global.ResizeObserver ??= class {
		observe() {}
		disconnect() {}
	} as never;
} );

afterEach( () => jest.restoreAllMocks() );

describe( 'ThreadParent', () => {
	it( 'expands and collapses a clamped comment', async () => {
		clampHidesText( true );
		render( <ThreadParent comment={ comment() } truncate compact /> );

		const toggle = screen.getByRole( 'button', { name: 'Show more' } );
		expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );

		await userEvent.click( toggle );

		expect( screen.getByText( 'The second paragraph.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Show less' } ) ).toHaveAttribute(
			'aria-expanded',
			'true'
		);
	} );

	it( 'expands when the clamped text itself is clicked', async () => {
		clampHidesText( true );
		render( <ThreadParent comment={ comment() } truncate compact /> );

		await userEvent.click( screen.getByText( 'The first paragraph of a long comment.' ) );

		expect( screen.getByRole( 'button', { name: 'Show less' } ) ).toBeVisible();
	} );

	it( 'tells screen readers which comment the reply answers', () => {
		render( <ThreadParent comment={ comment() } truncate compact /> );

		expect( screen.getByText( 'In reply to Mia Chen' ) ).toBeInTheDocument();
	} );

	it( 'starts the next reply’s quote collapsed', async () => {
		clampHidesText( true );
		const reply = ( id: number ) =>
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
			} ) as Note;
		const panel = ( note: Note ) => (
			<Provider store={ initStore() }>
				<AppProvider client={ null } locale="en">
					<SimplifiedNote note={ note } />
				</AppProvider>
			</Provider>
		);
		const { rerender } = render( panel( reply( 2 ) ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Show more' } ) );
		rerender( panel( reply( 3 ) ) );

		expect( screen.getByRole( 'button', { name: 'Show more' } ) ).toHaveAttribute(
			'aria-expanded',
			'false'
		);
	} );

	it( 'offers nothing to expand when the comment fits in two lines', () => {
		clampHidesText( false );
		render( <ThreadParent comment={ comment() } truncate compact /> );

		expect( screen.queryByRole( 'button', { name: 'Show more' } ) ).not.toBeInTheDocument();
	} );

	it( 'offers nothing to expand when only the excerpt is available', () => {
		clampHidesText( true );
		render( <ThreadParent comment={ comment( { content: undefined } ) } truncate compact /> );

		expect( screen.queryByRole( 'button', { name: 'Show more' } ) ).not.toBeInTheDocument();
	} );
} );
