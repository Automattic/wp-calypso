/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Interval, { EVERY_SECOND, EVERY_MINUTE } from '../index';

jest.useFakeTimers();

describe( 'Interval', () => {
	describe( 'Running actions', () => {
		test( 'Does not run onTick() on mount', () => {
			const spy = jest.fn();
			mount( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
			expect( spy.mock.calls.length ).toBe( 0 );
		} );

		test( 'Runs onTick() on the intervals', () => {
			const spy = jest.fn();
			mount( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
			jest.runTimersToTime( 1000 );
			expect( spy.mock.calls.length ).toBe( 1 );
		} );

		test( 'Respects the period passed', () => {
			const spy = jest.fn();
			mount( <Interval onTick={ spy } period={ EVERY_MINUTE } /> );
			jest.runTimersToTime( 1000 * 60 );
			expect( spy.mock.calls.length ).toBe( 1 );
		} );

		test( 'Stops running the interval on unmount', () => {
			const spy = jest.fn();
			const wrapper = mount( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
			jest.runTimersToTime( 1000 );
			expect( spy.mock.calls.length ).toBe( 1 );
			wrapper.unmount();
			jest.runTimersToTime( 2000 );
			expect( spy.mock.calls.length ).toBe( 1 );
		} );

		test( 'Changes the interval when the period changes', () => {
			const spy = jest.fn();
			const wrapper = mount( <Interval onTick={ spy } period={ EVERY_SECOND } /> );
			jest.runTimersToTime( 1000 );
			expect( spy.mock.calls.length ).toBe( 1 );
			wrapper.setProps( { onTick: spy, period: EVERY_MINUTE } );
			expect( spy.mock.calls.length ).toBe( 1 );
			jest.runTimersToTime( 60 * 1000 );
			expect( spy.mock.calls.length ).toBe( 2 );
		} );

		test( 'Picks up a new ticker even if the period does not change', () => {
			const spy = jest.fn();
			const otherSpy = jest.fn();

			const wrapper = mount( <Interval onTick={ spy } period={ EVERY_SECOND } /> );

			jest.runTimersToTime( 1000 );
			expect( spy.mock.calls.length ).toBe( 1 );

			wrapper.setProps( { onTick: otherSpy, period: EVERY_SECOND } );
			expect( spy.mock.calls.length ).toBe( 1 );
			expect( otherSpy.mock.calls.length ).toBe( 0 );

			jest.runTimersToTime( 1000 );
			expect( spy.mock.calls.length ).toBe( 1 );
		} );
	} );
} );
