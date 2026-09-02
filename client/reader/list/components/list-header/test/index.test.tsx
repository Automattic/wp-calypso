/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ComponentProps } from 'react';
import readerReducer from 'calypso/state/reader/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderListHeader from '..';

const defaultList: ComponentProps< typeof ReaderListHeader >[ 'list' ] = {
	ID: 1,
	slug: 'my-list',
	title: 'My List',
	description: 'A test list',
	owner: 'test_user',
	is_owner: true,
	is_public: true,
	feeds: [],
};

function renderReaderListHeader(
	props: Partial< ComponentProps< typeof ReaderListHeader > > = {}
) {
	const defaultRenderOptions = {
		initialState: {
			currentUser: {
				user: { username: 'test_user' },
			},
		},
		reducers: { reader: readerReducer },
	};

	return renderWithProvider(
		<ReaderListHeader list={ defaultList } view="posts" { ...props } />,
		defaultRenderOptions
	);
}

function nockListItems( owner: string, slug: string, response: Record< string, unknown > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/read/lists/${ owner }/${ slug }/items` )
		.query( true )
		.reply( 200, response );
}

describe( 'ReaderListHeader', () => {
	// NavTabs uses IntersectionObserver which jsdom does not provide.
	beforeAll( () => {
		global.IntersectionObserver = class IntersectionObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof global.IntersectionObserver;
	} );

	afterAll( () => {
		// @ts-expect-error -- cleaning up the stub
		delete global.IntersectionObserver;
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'does not render section nav when list is undefined', () => {
		renderReaderListHeader( { list: undefined } );

		expect( screen.queryByRole( 'menuitem' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the list title', () => {
		renderReaderListHeader();

		expect( screen.getByRole( 'heading', { name: /My List/i } ) ).toBeVisible();
	} );

	test( 'renders the list description', () => {
		renderReaderListHeader();

		expect( screen.getByText( 'A test list' ) ).toBeVisible();
	} );

	test( 'shows owner name when list is not owned by current user', () => {
		renderReaderListHeader( { list: { ...defaultList, owner: 'otheruser', is_owner: false } } );

		expect( screen.getByText( 'otheruser' ) ).toBeVisible();
	} );

	test( 'does not show owner name when list is owned by current user', () => {
		renderReaderListHeader();

		expect( screen.queryByText( /\(/ ) ).not.toBeInTheDocument();
	} );

	test( 'shows lock icon for private lists', () => {
		renderReaderListHeader( { list: { ...defaultList, is_public: false } } );

		expect( screen.getByTitle( 'Private list' ) ).toBeVisible();
	} );

	test( 'does not show lock icon for public lists', () => {
		renderReaderListHeader();

		expect( screen.queryByTitle( 'Private list' ) ).not.toBeInTheDocument();
	} );

	test( 'shows follow button when user is not the owner', () => {
		renderReaderListHeader( { list: { ...defaultList, is_owner: false } } );

		expect( screen.getByLabelText( 'Subscribe' ) ).toBeVisible();
	} );

	test( 'does not show follow button when user is the owner', () => {
		renderReaderListHeader();

		expect( screen.queryByLabelText( 'Subscribe' ) ).not.toBeInTheDocument();
	} );

	test( 'follow button can be clicked without error', async () => {
		const user = userEvent.setup();

		renderReaderListHeader( { list: { ...defaultList, is_owner: false } } );

		await user.click( screen.getByLabelText( 'Subscribe' ) );
		expect( screen.getByLabelText( /Subscribe|Unsubscribe/ ) ).toBeVisible();
	} );

	test( 'shows edit button when user is the owner', () => {
		renderReaderListHeader();

		expect( screen.getByText( 'Edit' ) ).toBeVisible();
	} );

	test( 'does not show edit button when user is not the owner', () => {
		renderReaderListHeader( { list: { ...defaultList, is_owner: false } } );

		expect( screen.queryByText( 'Edit' ) ).not.toBeInTheDocument();
	} );

	test( 'renders Posts and Sites nav tabs', () => {
		renderReaderListHeader();

		expect( screen.getByRole( 'menuitem', { name: /Posts/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /Sites/i } ) ).toBeVisible();
	} );

	test( 'marks Posts tab as selected when view is posts', () => {
		renderReaderListHeader();

		expect( screen.getByRole( 'menuitem', { name: /Posts/i } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect( screen.getByRole( 'menuitem', { name: /Sites/i } ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
	} );

	test( 'marks Sites tab as selected when view is sites', () => {
		renderReaderListHeader( { view: 'sites' } );

		expect( screen.getByRole( 'menuitem', { name: /Posts/i } ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
		expect( screen.getByRole( 'menuitem', { name: /Sites/i } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
	} );

	test( 'generates correct nav tab paths', () => {
		renderReaderListHeader();

		expect( screen.getByRole( 'menuitem', { name: /Posts/i } ) ).toHaveAttribute(
			'href',
			'/reader/list/test_user/my-list'
		);
		expect( screen.getByRole( 'menuitem', { name: /Sites/i } ) ).toHaveAttribute(
			'href',
			'/reader/list/test_user/my-list/sites'
		);
	} );

	test( 'shows total items count on Sites tab', async () => {
		nockListItems( 'test_user', 'my-list', { total_items: 42, items: [] } );

		renderReaderListHeader();

		expect( await screen.findByText( '42' ) ).toBeVisible();
	} );

	test( 'links owner name to the user profile page', () => {
		renderReaderListHeader( { list: { ...defaultList, owner: 'otheruser', is_owner: false } } );

		const ownerLink = screen.getByRole( 'link', { name: 'otheruser' } );
		expect( ownerLink ).toHaveAttribute( 'href', '/reader/users/otheruser' );
	} );
} );
