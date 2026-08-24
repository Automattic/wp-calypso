/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useScrollMargin } from '../use-scroll-margin';
import { MockResizeObserver, installResizeObserver, setRect } from './helpers';

beforeEach( () => {
	installResizeObserver();
} );

describe( 'useScrollMargin', () => {
	it( 'returns 0 when either element is missing', () => {
		const { result } = renderHook( () => useScrollMargin( null, null ) );

		expect( result.current ).toBe( 0 );
	} );

	it( 'is the list top minus the container top plus the container scroll', () => {
		const scrollElement = document.createElement( 'div' );
		const listElement = document.createElement( 'div' );
		setRect( scrollElement, { top: 50 } );
		setRect( listElement, { top: 170 } );
		scrollElement.scrollTop = 30;

		const { result } = renderHook( () => useScrollMargin( listElement, scrollElement ) );

		expect( result.current ).toBe( 150 ); // 170 - 50 + 30
	} );

	it( 'recomputes when an observed element resizes', () => {
		const scrollElement = document.createElement( 'div' );
		const listElement = document.createElement( 'div' );
		setRect( scrollElement, { top: 0 } );
		setRect( listElement, { top: 100 } );

		const { result } = renderHook( () => useScrollMargin( listElement, scrollElement ) );
		expect( result.current ).toBe( 100 );

		setRect( listElement, { top: 140 } ); // a header above the list grew
		act( () => MockResizeObserver.triggerAll() );

		expect( result.current ).toBe( 140 );
	} );
} );
