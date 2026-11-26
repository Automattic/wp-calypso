/**
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { useInterval } from '../use-interval';
import type { TimeoutMS } from 'calypso/types';

vi.useFakeTimers();

type TestComponentProps = {
	delay: TimeoutMS | null | false;
	callback: () => void;
};

function TestComponent( { delay, callback }: TestComponentProps ) {
	useInterval( callback, delay );
	return null;
}

describe( 'useInterval', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	test( 'runs callback at finite delay', () => {
		const callback = vi.fn();

		render( <TestComponent callback={ callback } delay={ 1000 } /> );
		vi.advanceTimersByTime( 1000 );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does not run callback when delay is null', () => {
		const callback = vi.fn();

		render( <TestComponent callback={ callback } delay={ null } /> );
		vi.advanceTimersByTime( 1000 );

		expect( callback ).not.toHaveBeenCalled();
	} );

	test( 'does not run callback when delay is false', () => {
		const callback = vi.fn();

		render( <TestComponent callback={ callback } delay={ false } /> );
		vi.advanceTimersByTime( 1000 );

		expect( callback ).not.toHaveBeenCalled();
	} );

	test.each( [ Infinity, NaN ] )( 'does not schedule a non-finite delay: %s', ( delay ) => {
		const callback = vi.fn();
		const setIntervalSpy = vi.spyOn( window, 'setInterval' );

		render( <TestComponent callback={ callback } delay={ delay } /> );
		vi.advanceTimersByTime( 1000 );

		expect( setIntervalSpy ).not.toHaveBeenCalled();
		expect( callback ).not.toHaveBeenCalled();
	} );

	test( 'does not schedule a non-positive delay', () => {
		const callback = vi.fn();
		const setIntervalSpy = vi.spyOn( window, 'setInterval' );

		render( <TestComponent callback={ callback } delay={ 0 } /> );
		vi.advanceTimersByTime( 1000 );

		expect( setIntervalSpy ).not.toHaveBeenCalled();
		expect( callback ).not.toHaveBeenCalled();
	} );

	test( 'clears the running interval when the delay becomes Infinity', () => {
		const callback = vi.fn();
		const { rerender } = render( <TestComponent callback={ callback } delay={ 1000 } /> );

		vi.advanceTimersByTime( 1000 );
		rerender( <TestComponent callback={ callback } delay={ Infinity } /> );
		vi.advanceTimersByTime( 5000 );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'starts an interval when the delay changes from Infinity to finite', () => {
		const callback = vi.fn();
		const { rerender } = render( <TestComponent callback={ callback } delay={ Infinity } /> );

		vi.advanceTimersByTime( 5000 );
		expect( callback ).not.toHaveBeenCalled();

		rerender( <TestComponent callback={ callback } delay={ 1000 } /> );
		vi.advanceTimersByTime( 1000 );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'clears interval when delay changes to null', () => {
		const callback = vi.fn();
		const { rerender } = render( <TestComponent callback={ callback } delay={ 1000 } /> );

		vi.advanceTimersByTime( 1000 );
		rerender( <TestComponent callback={ callback } delay={ null } /> );
		vi.advanceTimersByTime( 1000 );

		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );
} );
