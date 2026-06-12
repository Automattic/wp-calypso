/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BlockRef, { type BlockSnapshot } from './block-ref';

const blocks: BlockSnapshot[] = [
	{
		clientId: 'a1',
		name: 'core/paragraph',
		attributes: { content: 'Revenue grew 23% YoY to $48.2M, driven by enterprise plan upgrades.' },
	},
	{
		clientId: 'a2',
		name: 'core/heading',
		attributes: { content: 'Revenue Highlights', level: 2 },
	},
	{
		clientId: 'a3',
		name: 'core/heading',
		// Intentionally no level — should render `Heading — "…"` (no H-number)
		attributes: { content: 'No-level heading' },
	},
	{
		clientId: 'a4',
		name: 'core/image',
		attributes: { alt: 'Revenue by Region chart', caption: '' },
	},
	{
		clientId: 'a5',
		name: 'core/list',
		attributes: {},
	},
	{
		clientId: 'a6',
		name: 'core/custom-block',
		attributes: {},
	},
];

describe( 'BlockRef', () => {
	it( 'renders "Post-wide" for null index, non-clickable', () => {
		render( <BlockRef index={ null } blocks={ blocks } /> );
		const el = screen.getByText( 'Post-wide' );
		expect( el.tagName ).toBe( 'SPAN' );
	} );

	it( 'renders a paragraph label with a truncated content snippet', () => {
		render( <BlockRef index={ 0 } blocks={ blocks } /> );
		// 40-char snippet + ellipsis; content is 70 chars long.
		expect( screen.getByText( /Paragraph — .+…/ ) ).toBeInTheDocument();
	} );

	it( 'renders a heading label with the level when set', () => {
		render( <BlockRef index={ 1 } blocks={ blocks } /> );
		expect( screen.getByText( /Heading \(H2\) — .+/ ) ).toBeInTheDocument();
	} );

	it( 'renders a heading label without a level when none is set (honours "do not assume")', () => {
		render( <BlockRef index={ 2 } blocks={ blocks } /> );
		expect( screen.getByText( /^Heading — / ) ).toBeInTheDocument();
		expect( screen.queryByText( /\(H\d+\)/ ) ).not.toBeInTheDocument();
	} );

	it( 'uses alt text for images when available', () => {
		render( <BlockRef index={ 3 } blocks={ blocks } /> );
		expect( screen.getByText( /Image — .+Revenue by Region.+/ ) ).toBeInTheDocument();
	} );

	it( 'falls back to a plain label for core/list (no suitable snippet source)', () => {
		render( <BlockRef index={ 4 } blocks={ blocks } /> );
		expect( screen.getByText( 'List' ) ).toBeInTheDocument();
	} );

	it( 'shows a prettified slug for unknown core/* blocks (first-letter uppercased)', () => {
		render( <BlockRef index={ 5 } blocks={ blocks } /> );
		expect( screen.getByText( 'Custom-block' ) ).toBeInTheDocument();
	} );

	it( 'renders "Block no longer present" when the index is out of bounds', () => {
		render( <BlockRef index={ 99 } blocks={ blocks } /> );
		expect( screen.getByText( 'Block no longer present' ) ).toBeInTheDocument();
	} );

	it( 'fires onFocus with the index when clicked', () => {
		const onFocus = jest.fn();
		render( <BlockRef index={ 1 } blocks={ blocks } onFocus={ onFocus } /> );
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( onFocus ).toHaveBeenCalledWith( 1 );
	} );

	it( 'renders a plain span (not a button) when onFocus is omitted', () => {
		render( <BlockRef index={ 1 } blocks={ blocks } /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );
