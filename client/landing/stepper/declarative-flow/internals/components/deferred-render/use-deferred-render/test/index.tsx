/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDeferredRender } from '../index';

describe( 'useDeferredRender', () => {
	beforeAll( () => {
		jest.resetAllMocks();
		jest.useFakeTimers();
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	it( 'starts isReadyToRender as false', () => {
		const { result } = renderHook( () => useDeferredRender( { timeMs: 1000 } ) );
		expect( result.current.isReadyToRender ).toBe( false );
	} );

	it( 'enables to render after the delay', async () => {
		const { result } = renderHook( () => useDeferredRender( { timeMs: 1000 } ) );

		await act( () => {
			jest.runAllTimers();
		} );

		await waitFor( () => {
			expect( result.current.isReadyToRender ).toBe( true );
		} );
	} );

	it( 'cancels the timeout when the component unmounts', async () => {
		const clearTimeoutSpy = jest.spyOn( global, 'clearTimeout' );
		const { result, unmount } = renderHook( () => useDeferredRender( { timeMs: 1000 } ) );
		unmount();

		await act( () => {
			jest.runAllTimers();
		} );

		expect( result.current.isReadyToRender ).toBe( false );
		expect( clearTimeoutSpy ).toHaveBeenCalled();
	} );
} );
