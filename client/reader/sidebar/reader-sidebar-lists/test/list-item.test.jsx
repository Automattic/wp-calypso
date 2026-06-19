/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarListsListItem from '../list-item';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

const list = {
	ID: 123,
	slug: 'favorites',
	owner: 'bob',
	title: 'Favorites',
};

describe( 'ReaderSidebarListsListItem', () => {
	let scrollIntoView;

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
} );
