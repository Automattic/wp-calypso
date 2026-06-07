// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LightweightMarkdownRenderer } from './LightweightMarkdownRenderer';

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

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
			root.render(
				<LightweightMarkdownRenderer>
					{ markdown }
				</LightweightMarkdownRenderer>
			);
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
		expect( container.querySelector( 'strong' )?.textContent ).toBe(
			'bold'
		);
		expect( container.querySelector( 'em' )?.textContent ).toBe( 'italic' );
		expect( container.querySelector( 'p code' )?.textContent ).toBe(
			'code'
		);
		expect( container.querySelectorAll( 'ul li' ) ).toHaveLength( 2 );
		expect( container.querySelectorAll( 'ol li' ) ).toHaveLength( 2 );
		expect( container.querySelector( 'a' ) ).toMatchObject( {
			href: 'https://example.com/',
			target: '_blank',
			rel: 'noreferrer',
		} );
		expect( container.querySelector( 'pre code' )?.textContent ).toBe(
			'const answer = 42;'
		);
	} );

	it( 'leaves unsafe links as text', async () => {
		await renderMarkdown(
			'[Unsafe](javascript:alert(1)) [Safe](mailto:test@example.com)'
		);

		const links = Array.from( container.querySelectorAll( 'a' ) );
		expect( links ).toHaveLength( 1 );
		expect( links[ 0 ].textContent ).toBe( 'Safe' );
		expect( container.textContent ).toContain(
			'[Unsafe](javascript:alert(1))'
		);
	} );

	it( 'keeps incomplete code fences renderable', async () => {
		await renderMarkdown( '```\nunfinished' );

		expect( container.querySelector( 'pre code' )?.textContent ).toBe(
			'unfinished'
		);
	} );
} );
