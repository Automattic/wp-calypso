/**
 * @jest-environment jsdom
 */
import { ReadList } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarListsListItem from '../list-item';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	isAutomatticianQuery: () => ( {
		queryKey: [ 'is-automattician' ],
		queryFn: () => true,
		initialData: true,
	} ),
} ) );

const list: ReadList = {
	ID: 123,
	slug: 'favorites',
	owner: 'bob',
	title: 'Favorites',
	description: '',
	is_owner: true,
	is_public: true,
	feeds: [],
};

describe( 'ReaderSidebarListsListItem', () => {
	let scrollIntoView: jest.Mock;

	beforeEach( () => {
		// jsdom does not implement scrollIntoView.
		scrollIntoView = jest.fn();
		window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
	} );

	it( 'renders the list link', () => {
		renderWithProvider( <ReaderSidebarListsListItem list={ list } path="/reader" /> );

		expect( screen.getByRole( 'link', { name: /Favorites/ } ) ).toBeVisible();
	} );

	it( 'scrolls the current list into view on mount', () => {
		// Regression test: the item ref must resolve to the rendered `li` DOM
		// node (MenuItem forwards its ref) for scrollIntoView to be reachable.
		renderWithProvider(
			<ReaderSidebarListsListItem
				list={ list }
				path="/reader"
				currentListSlug="favorites"
				currentListOwner="bob"
			/>
		);

		expect( scrollIntoView ).toHaveBeenCalled();
	} );

	it( 'does not scroll when the list is not the current list', () => {
		renderWithProvider(
			<ReaderSidebarListsListItem
				list={ list }
				path="/reader"
				currentListSlug="other"
				currentListOwner="bob"
			/>
		);

		expect( scrollIntoView ).not.toHaveBeenCalled();
	} );

	describe( 'unseen count', () => {
		it( 'does not show a count when the list has no feeds', () => {
			const { container } = renderWithProvider(
				<ReaderSidebarListsListItem list={ { ...list, feeds: [] } } path="/reader" />
			);

			expect( container.querySelector( '.a8c-count' ) ).toBeNull();
		} );

		it( 'does not show a count when every feed is fully seen', () => {
			const listNoUnseen: ReadList = {
				...list,
				feeds: [
					{ feed_id: 1, unseen_count: 0 },
					{ feed_id: 2, unseen_count: 0 },
				],
			};

			const { container } = renderWithProvider(
				<ReaderSidebarListsListItem list={ listNoUnseen } path="/reader" />
			);

			expect( container.querySelector( '.a8c-count' ) ).toBeNull();
		} );

		it( 'shows the unseen count summed across the list feeds', () => {
			const listWithUnseen: ReadList = {
				...list,
				feeds: [
					{ feed_id: 1, unseen_count: 2 },
					{ feed_id: 2, unseen_count: 3 },
				],
			};

			const { container } = renderWithProvider(
				<ReaderSidebarListsListItem list={ listWithUnseen } path="/reader" />
			);

			expect( container.querySelector( '.a8c-count' ) ).toHaveTextContent( '5' );
		} );
	} );

	describe( 'recommended-blogs list', () => {
		const currentUserState = { currentUser: { id: 1, user: { ID: 1, username: 'bob' } } };

		it( "renders nothing when the current user owns the 'recommended-blogs' list", () => {
			const recommended: ReadList = {
				...list,
				owner: 'bob',
				slug: 'recommended-blogs',
				title: 'Recommended blogs',
			};

			renderWithProvider( <ReaderSidebarListsListItem list={ recommended } path="/reader" />, {
				initialState: currentUserState,
			} );

			expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		} );

		it( "renders the 'recommended-blogs' list when it belongs to another user", () => {
			const recommended: ReadList = {
				...list,
				owner: 'alice',
				slug: 'recommended-blogs',
				title: 'Recommended blogs',
			};

			renderWithProvider( <ReaderSidebarListsListItem list={ recommended } path="/reader" />, {
				initialState: currentUserState,
			} );

			expect( screen.getByRole( 'link', { name: /Recommended blogs/ } ) ).toBeVisible();
		} );

		it( "renders the current user's other owned lists", () => {
			renderWithProvider( <ReaderSidebarListsListItem list={ list } path="/reader" />, {
				initialState: currentUserState,
			} );

			expect( screen.getByRole( 'link', { name: /Favorites/ } ) ).toBeVisible();
		} );
	} );
} );
