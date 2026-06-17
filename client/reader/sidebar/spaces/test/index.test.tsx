/**
 * @jest-environment jsdom
 */
import { readSpacesQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { getSpacePath } from 'calypso/reader/spaces/routes';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ReaderSidebarSpaces } from '../index';
import type { ReadSpace } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { replace: jest.fn() } ),
} ) );

const SPACES: ReadSpace[] = [
	{
		id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
		name: 'Work',
		layout: { color: 'blue', icon: 'inbox' },
	},
	{
		id: '5cc71d31-97d1-4b7d-93c7-42a5ce9d4cf1',
		name: 'Gaming',
		layout: { color: 'purple', icon: 'box' },
	},
];

// Render on a space route so the expandable menu starts open and its rows are
// visible (collapsed content is `hidden`, hence not accessible).
const FIRST_SPACE = SPACES[ 0 ];
const OPEN_PATH = getSpacePath( FIRST_SPACE.id );

function render( ui: React.ReactElement ) {
	// Seed the spaces list so `useSpaces()` resolves synchronously.
	const queryClient = new QueryClient();
	queryClient.setQueryData( readSpacesQuery().queryKey, [ ...SPACES ] );
	return renderWithProvider( ui, { queryClient } );
}

describe( 'ReaderSidebarSpaces', () => {
	beforeEach( () => {
		jest.mocked( page ).mockClear();
		jest.mocked( page.replace ).mockClear();
	} );

	afterEach( () => nock.cleanAll() );

	it( 'renders every space with a link to its page', () => {
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
		expect( selected[ 0 ] ).toHaveClass( `sidebar-spaces__item--${ FIRST_SPACE.layout.color }` );
	} );

	it( 'does not crash or falsely select on an unexpected space id in the path', () => {
		// A segment that matches no space (and isn't URL-safe) must not throw or
		// mark a row active.
		const { container } = render( <ReaderSidebarSpaces path="/reader/spaces/%E0%A4%A" /> );

		// Rendered fine, with no row marked active.
		expect( container.querySelector( 'li.sidebar__menu-item.selected' ) ).toBeNull();
	} );

	it( 'opens the create-space modal from the "Add a space" button', async () => {
		const user = userEvent.setup();
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Add a space' } ) );

		const dialog = await screen.findByRole( 'dialog' );
		expect( dialog ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Create a new space' } ) ).toBeVisible();
	} );

	it( 'redirects to the new space sources action after creating a space', async () => {
		const user = userEvent.setup();
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/reader/spaces' )
			.reply( 201, {
				id: 7,
				title: 'Reading',
				follows: [],
				tags: [],
				layout: { color: 'blue', icon: 'inbox' },
			} );
		render( <ReaderSidebarSpaces path={ OPEN_PATH } /> );

		await user.click( screen.getByRole( 'button', { name: 'Add a space' } ) );
		await user.type( screen.getByLabelText( 'Name' ), 'Reading' );
		await user.click( screen.getByRole( 'button', { name: 'Create' } ) );

		// The redirect happens in the create mutation's onSuccess, after the POST
		// resolves, so wait for it.
		await waitFor( () =>
			expect( page ).toHaveBeenCalledWith(
				expect.stringMatching( /^\/reader\/spaces\/.+#action=manage-sources$/ )
			)
		);
	} );

	it( 'does not render the sources modal from the sidebar', () => {
		render( <ReaderSidebarSpaces path={ `${ OPEN_PATH }#action=manage-sources` } /> );

		expect(
			screen.queryByRole( 'heading', { name: 'Sources for “Work”' } )
		).not.toBeInTheDocument();
	} );
} );
