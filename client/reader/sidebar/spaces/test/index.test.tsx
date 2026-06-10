/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { SPACES, SPACES_BASE_PATH, getSpacePath } from 'calypso/reader/spaces/spaces-data';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import ReaderSidebarSpaces from '../index';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

// Render on a space route so the expandable menu starts open and its rows are
// visible (collapsed content is `hidden`, hence not accessible).
const FIRST_SPACE = SPACES[ 0 ];
const OPEN_PATH = getSpacePath( FIRST_SPACE.id );

describe( 'ReaderSidebarSpaces', () => {
	it( 'renders every hard-coded space with a link to its page', () => {
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		SPACES.forEach( ( space ) => {
			const link = screen.getByRole( 'link', { name: new RegExp( space.name ) } );
			expect( link ).toHaveAttribute( 'href', getSpacePath( space.id ) );
		} );
	} );

	it( 'marks the active space as selected and tags it with its colour modifier', () => {
		const { container } = render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		const selected = container.querySelectorAll( 'li.sidebar__menu-item.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( FIRST_SPACE.name );
		// The active row carries the space's colour class, which drives the
		// active link colour via the `--space-color` custom property.
		expect( selected[ 0 ] ).toHaveClass( `sidebar-spaces__item--${ FIRST_SPACE.color }` );
	} );

	it( 'does not crash or falsely select on an unexpected space id in the path', () => {
		// A segment that matches no space (and isn't URL-safe) must not throw or
		// mark a row active.
		const { container } = render( <ReaderSidebarSpaces path="/reader/spaces/%E0%A4%A" /> );

		// Rendered fine, with no row marked active.
		expect( container.querySelector( 'li.sidebar__menu-item.selected' ) ).toBeNull();
	} );

	it( 'renders an "Add a space" link to the spaces landing route', () => {
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		expect( screen.getByRole( 'link', { name: 'Add a space' } ) ).toHaveAttribute(
			'href',
			SPACES_BASE_PATH
		);
	} );
} );
