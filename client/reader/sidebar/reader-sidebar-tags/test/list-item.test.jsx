/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarTagsListItem from '../list-item';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

const tag = {
	id: 'tag-1',
	slug: 'photography',
	displayName: 'Photography',
	url: '/tag/photography',
};

describe( 'ReaderSidebarTagsListItem', () => {
	let scrollIntoView;

	beforeEach( () => {
		// jsdom does not implement scrollIntoView.
		scrollIntoView = jest.fn();
		window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
	} );

	it( 'renders the tag link', () => {
		renderWithProvider( <ReaderSidebarTagsListItem tag={ tag } path="/reader" /> );

		expect( screen.getByRole( 'link', { name: "View tag 'Photography'" } ) ).toBeVisible();
	} );

	it( 'scrolls the current tag into view on mount', () => {
		// Regression test: the item ref must resolve to the rendered `li` DOM
		// node (MenuItem forwards its ref) for scrollIntoView to be reachable.
		renderWithProvider(
			<ReaderSidebarTagsListItem tag={ tag } path="/reader" currentTag="photography" />
		);

		expect( scrollIntoView ).toHaveBeenCalled();
	} );

	it( 'does not scroll when the tag is not the current tag', () => {
		renderWithProvider(
			<ReaderSidebarTagsListItem tag={ tag } path="/reader" currentTag="travel" />
		);

		expect( scrollIntoView ).not.toHaveBeenCalled();
	} );
} );
