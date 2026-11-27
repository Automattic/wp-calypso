/**
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { Interval, EVERY_SECOND, EVERY_MINUTE } from '../index';

vi.useFakeTimers();

describe( 'Interval', () => {
	test( 'Does not run onTick() on mount', () => {
		const spy = vi.fn();

		render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );

		expect( spy ).not.toHaveBeenCalled();
	} );

	test( 'Runs onTick() on the intervals', () => {
		const spy = vi.fn();

		render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		vi.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Respects the period passed', () => {
		const spy = vi.fn();

		render( <Interval onTick={ spy } period={ EVERY_MINUTE } /> );
		vi.advanceTimersByTime( 1000 * 60 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Stops running the interval on unmount', () => {
		const spy = vi.fn();

		const { unmount } = render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		vi.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		unmount();

		vi.advanceTimersByTime( 2000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Changes the interval when the period changes', () => {
		const spy = vi.fn();

		const { rerender } = render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		vi.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		rerender( <Interval onTick={ spy } period={ EVERY_MINUTE } /> );

		vi.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		vi.advanceTimersByTime( 60 * 1000 );

		expect( spy ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'Picks up a new ticker even if the period does not change', () => {
		const spy = vi.fn();
		const otherSpy = vi.fn();

		const { rerender } = render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		vi.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		rerender( <Interval onTick={ otherSpy } period={ EVERY_SECOND } /> );

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( otherSpy ).not.toHaveBeenCalled();

		vi.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( otherSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );
