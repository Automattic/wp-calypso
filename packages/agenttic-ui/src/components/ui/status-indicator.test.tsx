// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StatusIndicator } from './status-indicator';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'StatusIndicator', () => {
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

	it( 'renders a decorative dot hidden from assistive technology', async () => {
		await act( async () => {
			root.render( <StatusIndicator /> );
		} );
		const svg = container.querySelector( 'svg' );
		expect( svg?.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
		expect( svg?.getAttribute( 'focusable' ) ).toBe( 'false' );
		expect( container.querySelectorAll( 'circle' ) ).toHaveLength( 1 );
	} );

	it( 'puts the fill on the circle so a host svg rule cannot override it', async () => {
		await act( async () => {
			root.render( <StatusIndicator /> );
		} );
		expect( container.querySelector( 'circle' )?.getAttribute( 'class' ) ).toContain( 'fill' );
	} );

	// The base fill is primary; only the other tones add a class in the build.
	it( 'keeps the base primary fill by default', async () => {
		await act( async () => {
			root.render( <StatusIndicator /> );
		} );
		const className = container.querySelector( 'svg' )?.getAttribute( 'class' );
		expect( className ).toContain( 'dot' );
		expect( className ).not.toContain( 'error' );
		expect( className ).not.toContain( 'muted' );
	} );

	it.each( [ 'error', 'muted' ] as const )( 'applies the %s tone class', async ( tone ) => {
		await act( async () => {
			root.render( <StatusIndicator tone={ tone } /> );
		} );
		expect( container.querySelector( 'svg' )?.getAttribute( 'class' ) ).toContain( tone );
	} );

	it( 'sizes to 12 by default and to the size prop when given', async () => {
		await act( async () => {
			root.render( <StatusIndicator /> );
		} );
		let svg = container.querySelector( 'svg' );
		expect( svg?.getAttribute( 'width' ) ).toBe( '12' );
		expect( svg?.getAttribute( 'height' ) ).toBe( '12' );

		await act( async () => {
			root.render( <StatusIndicator size={ 24 } /> );
		} );
		svg = container.querySelector( 'svg' );
		expect( svg?.getAttribute( 'width' ) ).toBe( '24' );
		expect( svg?.getAttribute( 'height' ) ).toBe( '24' );
	} );
} );
