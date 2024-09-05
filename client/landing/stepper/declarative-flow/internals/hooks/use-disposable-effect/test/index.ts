/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useDisposableEffect from '..';

describe( 'useDisposableEffect', () => {
	it( 'calls the effect function', () => {
		const effect = jest.fn();
		renderHook( () => useDisposableEffect( effect, [] ) );

		expect( effect ).toHaveBeenCalled();
	} );

	it( 'does not call the effect function again if the dependencies do not change', () => {
		const effect = jest.fn();
		const { rerender } = renderHook( () => useDisposableEffect( effect, [] ) );

		rerender();
		expect( effect ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls the effect function again if the dependencies change', () => {
		const effect = jest.fn();
		const { rerender } = renderHook( () => useDisposableEffect( effect, [ { foo: 'bar' } ] ) );

		rerender();
		expect( effect ).toHaveBeenCalledTimes( 2 );
	} );

	it( "doesn't call the effect function if the effect is disposed", () => {
		const spy = jest.fn();
		const effect = ( dispose: () => void ) => {
			spy();
			dispose();
		};
		const { rerender } = renderHook( () => useDisposableEffect( effect, [ { foo: 'bar' } ] ) );

		rerender();
		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );
} );
