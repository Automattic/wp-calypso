// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageCard } from './MessageCard';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'MessageCard', () => {
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

	it( 'runs `onClick` when the linked card is clicked', async () => {
		const onClick = vi.fn();
		await act( async () => {
			root.render(
				<MessageCard title="Out of credits" url="/checkout/credits" onClick={ onClick } />
			);
		} );

		const link = container.querySelector( 'a' )!;
		expect( link.getAttribute( 'href' ) ).toBe( '/checkout/credits' );
		link.addEventListener( 'click', ( event ) => event.preventDefault() );
		await act( async () => link.click() );
		expect( onClick ).toHaveBeenCalledOnce();
	} );
} );
