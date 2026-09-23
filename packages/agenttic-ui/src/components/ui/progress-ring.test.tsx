// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProgressRing, clampPercent } from './progress-ring';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'clampPercent', () => {
	it( 'clamps to 0–100 without rounding', () => {
		expect( clampPercent( 55.9 ) ).toBe( 55.9 );
		expect( clampPercent( 0.4 ) ).toBe( 0.4 );
		expect( clampPercent( 140 ) ).toBe( 100 );
		expect( clampPercent( -3 ) ).toBe( 0 );
		expect( clampPercent( Number.NaN ) ).toBe( 0 );
	} );
} );

describe( 'ProgressRing', () => {
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

	it( 'offsets the arc by the missing share of the circumference', async () => {
		await act( async () => {
			root.render( <ProgressRing percent={ 25 } size={ 16 } strokeWidth={ 2 } /> );
		} );
		const fill = container.querySelectorAll( 'circle' )[ 1 ];
		const circumference = 2 * Math.PI * 7;
		expect( Number( fill.getAttribute( 'stroke-dasharray' ) ) ).toBeCloseTo( circumference );
		expect( Number( fill.getAttribute( 'stroke-dashoffset' ) ) ).toBeCloseTo(
			circumference * 0.75
		);
	} );

	it( 'keeps drawing a fractional remainder instead of treating it as empty', async () => {
		await act( async () => {
			root.render( <ProgressRing percent={ 0.4 } size={ 16 } strokeWidth={ 2 } /> );
		} );
		const svg = container.querySelector( 'svg' );
		expect( svg?.getAttribute( 'class' ) ).not.toContain( 'empty' );
		const fill = container.querySelectorAll( 'circle' )[ 1 ];
		const circumference = 2 * Math.PI * 7;
		expect( Number( fill.getAttribute( 'stroke-dashoffset' ) ) ).toBeCloseTo(
			circumference * ( 1 - 0.004 )
		);
	} );

	it( 'applies the tone class and hides the arc at zero', async () => {
		await act( async () => {
			root.render( <ProgressRing percent={ 0 } tone="error" /> );
		} );
		const svg = container.querySelector( 'svg' );
		expect( svg?.getAttribute( 'class' ) ).toContain( 'error' );
		expect( svg?.getAttribute( 'class' ) ).toContain( 'empty' );
		expect( svg?.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
	} );
} );
