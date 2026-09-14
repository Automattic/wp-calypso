/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { getBlockType } from '@wordpress/blocks';
import BlockRef, { type BlockSnapshot } from './block-ref';

// Mock the block registry + icon renderer so the chip's icon/title lookups are
// deterministic and don't pull in the full editor. `getBlockType` returns
// undefined by default (nothing registered), which each test can override.
jest.mock( '@wordpress/blocks', () => ( {
	getBlockType: jest.fn(),
} ) );
jest.mock( '@wordpress/block-editor', () => {
	const react = jest.requireActual< typeof import('react') >( 'react' );
	return {
		BlockIcon: ( { icon }: { icon?: unknown } ) =>
			react.createElement(
				'span',
				{ 'data-testid': 'block-icon' },
				typeof icon === 'string' ? icon : ''
			),
	};
} );

const mockGetBlockType = getBlockType as unknown as jest.Mock;

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
	beforeEach( () => {
		mockGetBlockType.mockReset();
		mockGetBlockType.mockReturnValue( undefined );
	} );

	it( 'renders "Post-wide" for null index, non-clickable, with no block icon', () => {
		render( <BlockRef index={ null } blocks={ blocks } /> );
		const el = screen.getByText( 'Post-wide' );
		expect( el.tagName ).toBe( 'SPAN' );
		expect( screen.queryByTestId( 'block-icon' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the block icon plus a content-only snippet (no type prefix)', () => {
		mockGetBlockType.mockReturnValue( { title: 'Paragraph', icon: 'paragraph' } );
		render( <BlockRef index={ 0 } blocks={ blocks } /> );
		// 40-char snippet + ellipsis; content is 67 chars long.
		expect( screen.getByText( /^Revenue grew 23% YoY to \$48\.2M,.+…$/ ) ).toBeInTheDocument();
		// No "Paragraph — " prefix — the icon conveys the type.
		expect( screen.queryByText( /Paragraph —/ ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'block-icon' ) ).toHaveTextContent( 'paragraph' );
	} );

	it( 'shows the full content snippet for short headings', () => {
		render( <BlockRef index={ 1 } blocks={ blocks } /> );
		expect( screen.getByText( 'Revenue Highlights' ) ).toBeInTheDocument();
	} );

	it( 'uses image alt text as the snippet', () => {
		render( <BlockRef index={ 2 } blocks={ blocks } /> );
		expect( screen.getByText( 'Revenue by Region chart' ) ).toBeInTheDocument();
	} );

	it( 'falls back to the prettified slug when no content and no registered title', () => {
		render( <BlockRef index={ 3 } blocks={ blocks } /> );
		expect( screen.getByText( 'List' ) ).toBeInTheDocument();
	} );

	it( 'prefers the registered block title over the slug for content-less blocks', () => {
		mockGetBlockType.mockReturnValue( { title: 'Custom Widget', icon: 'star' } );
		render( <BlockRef index={ 4 } blocks={ blocks } /> );
		expect( screen.getByText( 'Custom Widget' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Custom-block' ) ).not.toBeInTheDocument();
	} );

	it( 'renders "Block no longer present" when the index is out of bounds', () => {
		render( <BlockRef index={ 99 } blocks={ blocks } /> );
		expect( screen.getByText( 'Block no longer present' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'block-icon' ) ).not.toBeInTheDocument();
	} );

	it( 'fires onFocus with the index when clicked', () => {
		const onFocus = jest.fn();
		render( <BlockRef index={ 1 } blocks={ blocks } onFocus={ onFocus } /> );
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( onFocus ).toHaveBeenCalledWith( 1 );
	} );

	it( 'renders the icon and snippet inside the clickable button variant', () => {
		mockGetBlockType.mockReturnValue( { title: 'Paragraph', icon: 'paragraph' } );
		render( <BlockRef index={ 1 } blocks={ blocks } onFocus={ jest.fn() } /> );
		const button = screen.getByRole( 'button' );
		expect( button.querySelector( '[data-testid="block-icon"]' ) ).not.toBeNull();
		expect( button ).toHaveTextContent( 'Revenue Highlights' );
	} );

	it( 'renders a plain span (not a button) when onFocus is omitted', () => {
		render( <BlockRef index={ 1 } blocks={ blocks } /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );
