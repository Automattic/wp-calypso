// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LightweightMarkdownRenderer } from './LightweightMarkdownRenderer';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'LightweightMarkdownRenderer', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	async function renderMarkdown( markdown: string ) {
		await act( async () => {
			root.render( <LightweightMarkdownRenderer>{ markdown }</LightweightMarkdownRenderer> );
		} );
	}

	it( 'renders common chat markdown without external markdown dependencies', async () => {
		await renderMarkdown(
			[
				'## Answer',
				'',
				'This is **bold**, _italic_, and `code`.',
				'- first',
				'- [second](https://example.com)',
				'1. ordered',
				'2. another',
				'```',
				'const answer = 42;',
				'```',
			].join( '\n' )
		);

		expect( container.querySelector( 'h2' )?.textContent ).toBe( 'Answer' );
		expect( container.querySelector( 'strong' )?.textContent ).toBe( 'bold' );
		expect( container.querySelector( 'em' )?.textContent ).toBe( 'italic' );
		expect( container.querySelector( 'p code' )?.textContent ).toBe( 'code' );
		expect( container.querySelectorAll( 'ul li' ) ).toHaveLength( 2 );
		expect( container.querySelectorAll( 'ol li' ) ).toHaveLength( 2 );
		expect( container.querySelector( 'a' ) ).toMatchObject( {
			href: 'https://example.com/',
			target: '_blank',
			rel: 'noreferrer',
		} );
		expect( container.querySelector( 'pre code' )?.textContent ).toBe( 'const answer = 42;' );
	} );

	it( 'leaves unsafe links as text', async () => {
		await renderMarkdown( '[Unsafe](javascript:alert(1)) [Safe](mailto:test@example.com)' );

		const links = Array.from( container.querySelectorAll( 'a' ) );
		expect( links ).toHaveLength( 1 );
		expect( links[ 0 ].textContent ).toBe( 'Safe' );
		expect( container.textContent ).toContain( '[Unsafe](javascript:alert(1))' );
	} );

	it( 'keeps incomplete code fences renderable', async () => {
		await renderMarkdown( '```\nunfinished' );

		expect( container.querySelector( 'pre code' )?.textContent ).toBe( 'unfinished' );
	} );

	it( 'renders headings and list items after extra or tab whitespace', async () => {
		await renderMarkdown( [ '###   Spaced', '#\tTabbed', '-\t  item', '1.  first' ].join( '\n' ) );

		expect( container.querySelector( 'h3' )?.textContent ).toBe( 'Spaced' );
		expect( container.querySelector( 'h1' )?.textContent ).toBe( 'Tabbed' );
		expect( container.querySelector( 'ul li' )?.textContent ).toBe( 'item' );
		expect( container.querySelector( 'ol li' )?.textContent ).toBe( 'first' );
	} );

	it( 'links only the innermost bracket text', async () => {
		await renderMarkdown( 'a [b [c](https://example.com) d' );

		expect( container.querySelector( 'a' )?.textContent ).toBe( 'c' );
		expect( container.textContent ).toBe( 'a [b c d' );
	} );

	const LINE_SEPARATOR = String.fromCharCode( 0x2028 );
	const REPEATS = 100_000;
	const MAX_RENDER_MS = 1_000;

	it.each( [
		[ 'brackets', '['.repeat( REPEATS ) ],
		[ 'unclosed links', '[a](' + '[(]('.repeat( REPEATS / 2 ) ],
		[ 'a list marker and tabs', '*' + '\t'.repeat( REPEATS ) + LINE_SEPARATOR ],
		[ 'an ordered list marker and tabs', '0.' + '\t'.repeat( REPEATS ) + LINE_SEPARATOR ],
		[ 'a heading marker and tabs', '#' + '\t'.repeat( REPEATS ) + LINE_SEPARATOR ],
	] )( 'renders %s without catastrophic backtracking', async ( _name, markdown ) => {
		const start = performance.now();

		await renderMarkdown( markdown );

		expect( performance.now() - start ).toBeLessThan( MAX_RENDER_MS );
	} );
} );
