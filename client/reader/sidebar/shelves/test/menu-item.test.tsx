/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Icon, rss } from '@wordpress/icons';
import { SHELF_ICONS } from 'calypso/reader/shelves/icons';
import { getShelfPath } from 'calypso/reader/shelves/routes';
import { ShelfMenuItem } from '../menu-item';
import type { ReadShelf, ShelfIcon } from '@automattic/api-core';

const SHELF: ReadShelf = {
	id: '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21',
	slug: 'work',
	name: 'Work',
	layout: { color: 'blue', icon: 'inbox' },
};

// The icon span is `aria-hidden`, so it's outside the accessibility tree; reach
// for the rendered glyph through the DOM.
function iconSvg( container: HTMLElement ): SVGSVGElement | null {
	return container.querySelector( '.sidebar-shelves__icon svg' );
}

// Render a `@wordpress/icons` glyph standalone to get the markup `ShelfMenuItem`
// should produce for that icon, so we can assert which glyph was chosen.
function referenceIconMarkup( icon: JSX.Element ): string {
	const { container, unmount } = render( <Icon icon={ icon } size={ 18 } /> );
	const markup = container.querySelector( 'svg' )?.innerHTML ?? '';
	unmount();
	return markup;
}

describe( 'ShelfMenuItem', () => {
	it( 'renders the shelf name and a link to its page', () => {
		render( <ShelfMenuItem shelf={ SHELF } isSelected={ false } onClick={ jest.fn() } /> );

		const link = screen.getByRole( 'link', { name: new RegExp( SHELF.name ) } );
		expect( link ).toHaveAttribute( 'href', getShelfPath( SHELF.slug ) );
	} );

	it( 'renders the glyph mapped from the shelf icon', () => {
		const { container } = render(
			<ShelfMenuItem shelf={ SHELF } isSelected={ false } onClick={ jest.fn() } />
		);

		const svg = iconSvg( container );
		expect( svg ).toBeInTheDocument();
		// It rendered the inbox glyph, not the fallback.
		expect( svg?.innerHTML ).toBe( referenceIconMarkup( SHELF_ICONS.inbox ) );
	} );

	it( 'falls back to the rss glyph when the API returns an unrecognized icon', () => {
		// The API can return an icon key outside the `ShelfIcon` union; cast to
		// simulate that runtime case. Before the fix this rendered `undefined`,
		// which made `<Icon>` throw via `cloneElement( undefined )`.
		const shelf: ReadShelf = {
			...SHELF,
			layout: { ...SHELF.layout, icon: 'totally-unknown-icon' as ShelfIcon },
		};

		const { container } = render(
			<ShelfMenuItem shelf={ shelf } isSelected={ false } onClick={ jest.fn() } />
		);

		const svg = iconSvg( container );
		expect( svg ).toBeInTheDocument();
		// The fallback is the rss glyph.
		expect( svg?.innerHTML ).toBe( referenceIconMarkup( rss ) );
	} );

	it( 'invokes onClick when the link is activated', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		render( <ShelfMenuItem shelf={ SHELF } isSelected={ false } onClick={ onClick } /> );

		await user.click( screen.getByRole( 'link', { name: new RegExp( SHELF.name ) } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'invokes onPrefetch when the link is hovered', async () => {
		const user = userEvent.setup();
		const onPrefetch = jest.fn();
		render(
			<ShelfMenuItem
				shelf={ SHELF }
				isSelected={ false }
				onClick={ jest.fn() }
				onPrefetch={ onPrefetch }
			/>
		);

		await user.hover( screen.getByRole( 'link', { name: new RegExp( SHELF.name ) } ) );

		expect( onPrefetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'marks the row as selected and tags it with the shelf colour modifier', () => {
		const { container } = render(
			<ShelfMenuItem shelf={ SHELF } isSelected onClick={ jest.fn() } />
		);

		const item = container.querySelector( 'li.sidebar__menu-item' );
		expect( item ).toHaveClass( 'selected' );
		expect( item ).toHaveClass( `sidebar-shelves__item--${ SHELF.layout.color }` );
	} );
} );
