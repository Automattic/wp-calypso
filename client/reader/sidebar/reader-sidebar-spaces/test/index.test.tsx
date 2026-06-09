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
const OPEN_PATH = getSpacePath( 'work' );

describe( 'ReaderSidebarSpaces', () => {
	it( 'renders every hard-coded space with a link to its page', () => {
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		SPACES.forEach( ( space ) => {
			const link = screen.getByRole( 'link', { name: new RegExp( space.name ) } );
			expect( link ).toHaveAttribute( 'href', getSpacePath( space.slug ) );
		} );
	} );

	it( 'shows the unread count for spaces that have one and hides it otherwise', () => {
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		// Work has 14 unread.
		expect( screen.getByText( '14' ) ).toBeVisible();
		// Cats has 0 unread — no badge rendered.
		expect( screen.queryByText( '0' ) ).not.toBeInTheDocument();
	} );

	it( 'marks the active space as selected', () => {
		const { container } = render( <ReaderSidebarSpaces path={ getSpacePath( 'work' ) } /> );

		const selected = container.querySelectorAll( 'li.sidebar__menu-item.selected' );
		expect( selected ).toHaveLength( 1 );
		expect( selected[ 0 ].textContent ).toContain( 'Work' );
	} );

	it( 'renders an "Add a space" link to the spaces landing route', () => {
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		expect( screen.getByRole( 'link', { name: 'Add a space' } ) ).toHaveAttribute(
			'href',
			SPACES_BASE_PATH
		);
	} );
} );
