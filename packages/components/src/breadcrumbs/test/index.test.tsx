/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useState } from 'react';
import { Breadcrumbs } from '../index';
import type { BreadcrumbItemProps } from '../types';

describe( 'Breadcrumbs', () => {
	it( 'renders nothing when there are no items or one item', () => {
		const { container, rerender } = render( <Breadcrumbs items={ [] } /> );
		expect( container ).toBeEmptyDOMElement();
		rerender( <Breadcrumbs items={ [ { label: 'Home', href: '#' } ] } /> );
		expect( container.firstChild ).toBeNull();
	} );
	it( 'renders two items correctly', () => {
		const { container } = render(
			<Breadcrumbs
				items={ [
					{ label: 'Home', href: '/' },
					{ label: 'Settings', href: '/settings' },
				] }
			/>
		);
		expect( screen.getByRole( 'link', { name: 'Home' } ) ).toBeVisible();
		// Current item should be visually hidden by default.
		expect( container.querySelector( '.components-visually-hidden' ) ).toBeInTheDocument();
	} );
	it( 'shows the current item when showCurrentItem is true', () => {
		const { container } = render(
			<Breadcrumbs
				items={ [
					{ label: 'Home', href: '/' },
					{ label: 'Settings', href: '/settings' },
				] }
				showCurrentItem
			/>
		);
		expect( screen.getByRole( 'link', { name: 'Home' } ) ).toBeVisible();
		expect( container.querySelector( '.components-visually-hidden' ) ).not.toBeInTheDocument();
	} );
	it( 'renders a dropdown menu for middle items when in compact mode', () => {
		render(
			<Breadcrumbs
				items={ [
					{ label: 'Home', href: '/' },
					{ label: 'Products', href: '/products' },
					{ label: 'Categories', href: '/products/categories' },
					{ label: 'Electronics', href: '/products/categories/electronics' },
				] }
				size="compact"
			/>
		);
		expect( screen.getByRole( 'link', { name: 'Home' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'More breadcrumb items' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Categories' } ) ).toBeVisible();
	} );
	// Integration test for state changes
	it( 'updates correctly when items change', async () => {
		const user = userEvent.setup();
		const TestComponent = () => {
			const [ items, setItems ] = useState< BreadcrumbItemProps[] >( [
				{ label: 'Home', href: '/' },
				{ label: 'Settings', href: '/settings' },
				{ label: 'Categories', href: '/products/categories' },
			] );
			return (
				<>
					<Breadcrumbs items={ items } showCurrentItem />
					<button
						onClick={ () =>
							setItems( [
								{ label: 'New home', href: '/' },
								{ label: 'New settings', href: '/settings' },
								{ label: 'New categories', href: '/products/categories' },
							] )
						}
					>
						Change Breadcrumbs
					</button>
				</>
			);
		};
		render( <TestComponent /> );
		expect( screen.getByRole( 'link', { name: 'Home' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Settings' } ) ).toBeVisible();
		// Update the state.
		await user.click( screen.getByRole( 'button' ) );
		expect( screen.getByRole( 'link', { name: 'New home' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'New settings' } ) ).toBeVisible();
	} );
} );
