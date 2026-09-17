/**
 * @jest-environment jsdom
 */

/**
 * Tests for useInfiniteList. We do NOT re-test TanStack Virtual's behaviour
 * (windowing, lanes, gap, measurement) — that's the library's own
 * responsibility, verified visually in Storybook. These pin only our glue: the
 * shape the hook returns and the `getListProps` guard-rail.
 */
import { renderHook } from '@testing-library/react';
import { useInfiniteList } from '../index';
import { installResizeObserver } from './helpers';
import type { UseInfiniteListOptions } from '../types';

beforeEach( () => {
	installResizeObserver();
} );

function setup( overrides: Partial< UseInfiniteListOptions > = {} ) {
	const scrollElement = document.createElement( 'div' );
	document.body.appendChild( scrollElement );
	const options: UseInfiniteListOptions = {
		scrollElement,
		count: 10,
		estimateSize: 100,
		getItemKey: ( i ) => `item-${ i }`,
		...overrides,
	};
	return renderHook( () => useInfiniteList( options ) );
}

describe( 'useInfiniteList', () => {
	it( 'returns the windowed items and a measureElement function', () => {
		const { result } = setup();

		expect( Array.isArray( result.current.items ) ).toBe( true );
		expect( typeof result.current.measureElement ).toBe( 'function' );
		expect( typeof result.current.scrollMargin ).toBe( 'number' );
	} );

	it( 'getListProps enforces the positioning and sizing the virtualizer needs', () => {
		const { result } = setup();

		const props = result.current.getListProps();
		expect( typeof props.ref ).toBe( 'function' );
		expect( props.style.position ).toBe( 'relative' );
		expect( props.style.blockSize ).toEqual( expect.any( Number ) );
	} );

	it( 'getListProps merges consumer className/style but keeps the enforced ones', () => {
		const { result } = setup();

		const props = result.current.getListProps( {
			className: 'feed',
			style: { padding: 12, position: 'static' },
		} );
		expect( props.className ).toBe( 'feed' );
		expect( props.style.padding ).toBe( 12 );
		expect( props.style.position ).toBe( 'relative' ); // enforced wins over the consumer's
	} );

	it( 'exposes imperative scroll helpers', () => {
		const { result } = setup();

		expect( typeof result.current.scrollToIndex ).toBe( 'function' );
		expect( typeof result.current.scrollToOffset ).toBe( 'function' );
	} );

	it( 'does not crash when no scroll element is attached yet', () => {
		expect( () => setup( { scrollElement: null } ) ).not.toThrow();
	} );
} );
