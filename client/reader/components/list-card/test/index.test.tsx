/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ListCard } from '../index';

const defaultProps = {
	title: 'Quirky Histories',
	description: 'A cabinet of curiosities',
	owner: 'benhuberman',
	itemCount: 30,
	tags: [ 'Arts & Entertainment', 'Technology', 'Science' ],
	items: [
		{ site_name: 'Site A', site_icon: 'https://example.com/a.png' },
		{ site_name: 'Site B', site_icon: null },
	],
	listUrl: '/reader/list/benhuberman/quirky-histories',
	isLoadingItems: false,
};

describe( 'ListCard', () => {
	test( 'renders title, description, and owner', () => {
		renderWithProvider( <ListCard { ...defaultProps } /> );

		expect( screen.getByText( 'Quirky Histories' ) ).toBeVisible();
		expect( screen.getByText( 'A cabinet of curiosities' ) ).toBeVisible();
		expect( screen.getByText( /benhuberman/ ) ).toBeVisible();
	} );

	test( 'renders site count', () => {
		renderWithProvider( <ListCard { ...defaultProps } /> );

		expect( screen.getByText( /30 sites/ ) ).toBeVisible();
	} );

	test( 'renders tag pills', () => {
		renderWithProvider( <ListCard { ...defaultProps } /> );

		expect( screen.getByText( 'Arts & Entertainment' ) ).toBeVisible();
		expect( screen.getByText( 'Technology' ) ).toBeVisible();
		expect( screen.getByText( 'Science' ) ).toBeVisible();
	} );

	test( 'renders Open list link with correct URL', () => {
		renderWithProvider( <ListCard { ...defaultProps } /> );

		const link = screen.getByRole( 'link', { name: /open list/i } );
		expect( link ).toHaveAttribute( 'href', '/reader/list/benhuberman/quirky-histories' );
	} );

	test( 'renders with empty tags', () => {
		renderWithProvider( <ListCard { ...defaultProps } tags={ [] } /> );

		expect( screen.getByText( 'Quirky Histories' ) ).toBeVisible();
	} );

	test( 'renders with empty items', () => {
		renderWithProvider( <ListCard { ...defaultProps } items={ [] } /> );

		expect( screen.getByText( 'Quirky Histories' ) ).toBeVisible();
	} );

	test( 'renders site icons', () => {
		renderWithProvider( <ListCard { ...defaultProps } /> );

		const img = screen.getByRole( 'img', { name: 'Site A' } );
		expect( img ).toBeVisible();
	} );

	test( 'shows skeleton icons when loading items', () => {
		const { container } = renderWithProvider(
			<ListCard { ...defaultProps } items={ [] } isLoadingItems />
		);

		expect( container.querySelector( '.list-card__icons-skeleton' ) ).toBeInTheDocument();
	} );
} );
