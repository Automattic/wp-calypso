/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThreadParent } from '../parts/thread';
import type { NoteParentComment } from '../../types';

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
