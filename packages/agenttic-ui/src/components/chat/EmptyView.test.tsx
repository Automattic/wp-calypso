// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EmptyView } from './EmptyView';

describe( 'EmptyView', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( () => {
		act( () => root.unmount() );
		container.remove();
	} );

	it( 'renders children where the suggestions go, instead of them', () => {
		act( () => {
			root.render(
				<EmptyView
					heading="Hello"
					help="Pick one"
					suggestions={ [ { id: 'chip', label: 'A chip', autoSubmit: true } ] }
				>
					<div data-testid="slot">Checklist</div>
				</EmptyView>
			);
		} );

		expect( container.querySelector( '[data-testid="slot"]' ) ).not.toBeNull();
		expect( container.textContent ).toContain( 'Hello' );
		expect( container.textContent ).toContain( 'Pick one' );
		expect( container.textContent ).not.toContain( 'A chip' );
	} );
} );
