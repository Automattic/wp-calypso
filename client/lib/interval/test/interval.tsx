/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Interval, EVERY_SECOND, EVERY_MINUTE } from '../index';

jest.useFakeTimers();

describe( 'Interval', () => {
	test( 'Does not run onTick() on mount', () => {
		const spy = jest.fn();

		render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );

		expect( spy ).not.toHaveBeenCalled();
	} );

	test( 'Runs onTick() on the intervals', () => {
		const spy = jest.fn();

		render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		jest.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Respects the period passed', () => {
		const spy = jest.fn();

		render( <Interval onTick={ spy } period={ EVERY_MINUTE } /> );
		jest.advanceTimersByTime( 1000 * 60 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Stops running the interval on unmount', () => {
		const spy = jest.fn();

		const { unmount } = render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		jest.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		unmount();

		jest.advanceTimersByTime( 2000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Changes the interval when the period changes', () => {
		const spy = jest.fn();

		const { rerender } = render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		jest.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		rerender( <Interval onTick={ spy } period={ EVERY_MINUTE } /> );

		jest.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		jest.advanceTimersByTime( 60 * 1000 );

		expect( spy ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'Picks up a new ticker even if the period does not change', () => {
		const spy = jest.fn();
		const otherSpy = jest.fn();

		const { rerender } = render( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
		jest.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		rerender( <Interval onTick={ otherSpy } period={ EVERY_SECOND } /> );

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( otherSpy ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 1000 );

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( otherSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );
