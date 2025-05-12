/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { Breadcrumbs } from '../index';

const ITEMS = [
	{ label: 'Home', href: '/' },
	{ label: 'Products', href: '/products' },
	{ label: 'Categories', href: '/products/categories' },
	{ label: 'Electronics', href: '/products/categories/electronics' },
	{ label: 'Laptops', href: '/products/categories/electronics/laptops' },
];

const TWO_ITEMS = ITEMS.slice( 0, 2 );
const THREE_ITEMS = ITEMS.slice( 0, 3 );
const FIVE_ITEMS = ITEMS.slice( 0, 5 );

describe( 'Breadcrumbs', () => {
	it( 'does not render any items to screen when there are less than 2 items', () => {
		const { rerender } = render( <Breadcrumbs items={ [] } /> );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		rerender( <Breadcrumbs items={ [ { label: 'Home', href: '#' } ] } /> );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a navigation landmark', () => {
		render( <Breadcrumbs items={ TWO_ITEMS } /> );
		expect( screen.getByRole( 'navigation' ) ).toHaveAccessibleName( 'Breadcrumbs' );
	} );

	it( 'shows a list item for each item and hides the last (current) item unless the showCurrentItem prop is true', () => {
		const { rerender } = render( <Breadcrumbs items={ TWO_ITEMS } /> );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( TWO_ITEMS.length );
		// Checking for the `components-visually-hidden` is not ideal,
		// but the `toBeVisible` matcher does not work here.
		expect( screen.getAllByRole( 'listitem' ).at( -1 ) ).toHaveClass(
			'components-visually-hidden'
		);

		rerender( <Breadcrumbs items={ TWO_ITEMS } showCurrentItem /> );

		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( TWO_ITEMS.length );
		// Checking for the `components-visually-hidden` is not ideal,
		// but the `toBeVisible` matcher does not work here.
		expect( screen.getAllByRole( 'listitem' ).at( -1 ) ).not.toHaveClass(
			'components-visually-hidden'
		);
	} );

	it( 'renders all items as links apart from the last (current) item which is rendered as non-interactive text', () => {
		render( <Breadcrumbs items={ TWO_ITEMS } /> );

		expect( screen.getAllByRole( 'link' ) ).toHaveLength( TWO_ITEMS.length - 1 );

		// Current item is shown as normal text (ie. not a link).
		const lastItemLabel = TWO_ITEMS[ TWO_ITEMS.length - 1 ].label;
		expect( screen.queryByRole( 'link', { name: lastItemLabel } ) ).not.toBeInTheDocument();

		// Since getByText would also match the offscreen copy, we are first
		// finding the nav container via getByRole, which instead ignores the
		// offscreen copy.
		within( screen.getByRole( 'navigation', { name: 'Breadcrumbs' } ) ).getByText( lastItemLabel );
	} );

	it( 'renders a dropdown menu for middle items when in compact mode', async () => {
		const user = userEvent.setup();

		const { rerender } = render( <Breadcrumbs items={ FIVE_ITEMS } /> );

		// All items (apart from the last) are rendered as links.
		FIVE_ITEMS.slice( 0, -1 ).forEach( ( item ) => {
			expect( screen.getByRole( 'link', { name: item.label } ) ).toBeVisible();
		} );
		expect(
			screen.queryByRole( 'link', { name: FIVE_ITEMS[ FIVE_ITEMS.length - 1 ].label } )
		).not.toBeInTheDocument();

		// Switch to compact variant
		rerender( <Breadcrumbs items={ FIVE_ITEMS } variant="compact" /> );

		const middleItems = FIVE_ITEMS.slice( 1, -2 );

		middleItems.forEach( ( item ) => {
			expect( screen.queryByRole( 'link', { name: item.label } ) ).not.toBeInTheDocument();
		} );
		const dropdownTrigger = screen.getByRole( 'button', { name: 'More breadcrumb items' } );
		expect( dropdownTrigger ).toBeVisible();

		await user.click( dropdownTrigger );

		middleItems.forEach( ( item ) => {
			expect( screen.getByRole( 'menuitem', { name: item.label } ) ).toBeVisible();
		} );
	} );

	it( 'does not render a dropdown menu for middle items when there are less than 4 items', () => {
		render( <Breadcrumbs items={ THREE_ITEMS } variant="compact" /> );

		// All items (apart from the last) are rendered as links.
		THREE_ITEMS.slice( 0, -1 ).forEach( ( item ) => {
			expect( screen.getByRole( 'link', { name: item.label } ) ).toBeVisible();
		} );
		expect(
			screen.queryByRole( 'button', { name: 'More breadcrumb items' } )
		).not.toBeInTheDocument();
	} );
} );
