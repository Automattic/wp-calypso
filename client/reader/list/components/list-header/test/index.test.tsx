/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ComponentProps } from 'react';
import ReaderListHeader from '..';

const defaultList: ComponentProps< typeof ReaderListHeader >[ 'list' ] = {
	ID: 1,
	slug: 'my-list',
	title: 'My List',
	description: 'A test list',
	owner: 'test_user',
	is_owner: true,
	is_public: true,
};

const defaultProps: ComponentProps< typeof ReaderListHeader > = {
	list: defaultList,
	currentUser: { username: 'test_user' },
	following: false,
	onFollowToggle: jest.fn(),
	view: 'posts',
};

function renderWithClient( ui: React.ReactElement ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
		},
	} );
	return rtlRender( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
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
		renderWithClient( <ReaderListHeader { ...defaultProps } list={ undefined } /> );

		expect( screen.queryByRole( 'menuitem' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the list title', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( screen.getByRole( 'heading', { name: /My List/i } ) ).toBeVisible();
	} );

	test( 'renders the list description', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( screen.getByText( 'A test list' ) ).toBeVisible();
	} );

	test( 'shows owner name when list is not owned by current user', () => {
		renderWithClient(
			<ReaderListHeader
				{ ...defaultProps }
				list={ { ...defaultList, owner: 'otheruser', is_owner: false } }
			/>
		);

		expect( screen.getByText( 'otheruser' ) ).toBeVisible();
	} );

	test( 'does not show owner name when list is owned by current user', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( screen.queryByText( /\(/ ) ).not.toBeInTheDocument();
	} );

	test( 'shows lock icon for private lists', () => {
		renderWithClient(
			<ReaderListHeader { ...defaultProps } list={ { ...defaultList, is_public: false } } />
		);

		expect( screen.getByTitle( 'Private list' ) ).toBeVisible();
	} );

	test( 'does not show lock icon for public lists', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( screen.queryByTitle( 'Private list' ) ).not.toBeInTheDocument();
	} );

	test( 'shows follow button when user is not the owner', () => {
		renderWithClient(
			<ReaderListHeader { ...defaultProps } list={ { ...defaultList, is_owner: false } } />
		);

		expect( screen.getByLabelText( 'Subscribe' ) ).toBeVisible();
	} );

	test( 'does not show follow button when user is the owner', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( screen.queryByLabelText( 'Subscribe' ) ).not.toBeInTheDocument();
	} );

	test( 'calls onFollowToggle when follow button is clicked', async () => {
		const user = userEvent.setup();
		const onFollowToggle = jest.fn();

		renderWithClient(
			<ReaderListHeader
				{ ...defaultProps }
				list={ { ...defaultList, is_owner: false } }
				onFollowToggle={ onFollowToggle }
			/>
		);

		await user.click( screen.getByLabelText( 'Subscribe' ) );
		expect( onFollowToggle ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'shows edit button when user is the owner', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( screen.getByText( 'Edit' ) ).toBeVisible();
	} );

	test( 'does not show edit button when user is not the owner', () => {
		renderWithClient(
			<ReaderListHeader { ...defaultProps } list={ { ...defaultList, is_owner: false } } />
		);

		expect( screen.queryByText( 'Edit' ) ).not.toBeInTheDocument();
	} );

	test( 'renders Posts and Sites nav tabs', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( screen.getByRole( 'menuitem', { name: /Posts/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /Sites/i } ) ).toBeVisible();
	} );

	test( 'marks Posts tab as selected when view is posts', () => {
		renderWithClient( <ReaderListHeader { ...defaultProps } view="posts" /> );

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
		renderWithClient( <ReaderListHeader { ...defaultProps } view="sites" /> );

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
		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

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

		renderWithClient( <ReaderListHeader { ...defaultProps } /> );

		expect( await screen.findByText( '42' ) ).toBeVisible();
	} );

	test( 'links owner name to the user profile page', () => {
		renderWithClient(
			<ReaderListHeader
				{ ...defaultProps }
				list={ { ...defaultList, owner: 'otheruser', is_owner: false } }
				currentUser={ { username: 'test_user' } }
			/>
		);

		const ownerLink = screen.getByRole( 'link', { name: 'otheruser' } );
		expect( ownerLink ).toHaveAttribute( 'href', '/reader/users/otheruser' );
	} );
} );
