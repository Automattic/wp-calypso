/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

/**
 * Internal dependencies
 */
import { Interval, EVERY_SECOND, EVERY_MINUTE } from '../index';

jest.useFakeTimers();

describe( 'Interval', () => {
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		unmountComponentAtNode( container );
		container.remove();
		container = null;
	} );

	test( 'Does not run onTick() on mount', () => {
		const spy = jest.fn();
		act( () => {
			render( <Interval onTick={ spy } period={ EVERY_SECOND } />, container );
		} );
		expect( spy ).not.toHaveBeenCalled();
	} );

	test( 'Runs onTick() on the intervals', () => {
		const spy = jest.fn();
		act( () => {
			render( <Interval onTick={ spy } period={ EVERY_SECOND } />, container );
		} );
		act( () => {
			jest.advanceTimersByTime( 1000 );
		} );
		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Respects the period passed', () => {
		const spy = jest.fn();
		act( () => {
			render( <Interval onTick={ spy } period={ EVERY_MINUTE } />, container );
		} );
		act( () => {
			jest.advanceTimersByTime( 1000 * 60 );
		} );
		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Stops running the interval on unmount', () => {
		const spy = jest.fn();
		act( () => {
			render( <Interval onTick={ spy } period={ EVERY_SECOND } />, container );
			jest.advanceTimersByTime( 1000 );
		} );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		act( () => {
			unmountComponentAtNode( container );
			jest.advanceTimersByTime( 2000 );
		} );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'Changes the interval when the period changes', () => {
		const spy = jest.fn();

		act( () => {
			render( <Interval onTick={ spy } period={ EVERY_SECOND } />, container );
			jest.advanceTimersByTime( 1000 );
		} );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		act( () => {
			render( <Interval onTick={ spy } period={ EVERY_MINUTE } />, container );
		} );

		// Separate `act` to ensure props are updated before advancing timers
		act( () => {
			jest.advanceTimersByTime( 1000 );
		} );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		act( () => {
			jest.advanceTimersByTime( 60 * 1000 );
		} );

		expect( spy ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'Picks up a new ticker even if the period does not change', () => {
		const spy = jest.fn();
		const otherSpy = jest.fn();

		act( () => {
			render( <Interval onTick={ spy } period={ EVERY_SECOND } />, container );
			jest.advanceTimersByTime( 1000 );
		} );

		expect( spy ).toHaveBeenCalledTimes( 1 );

		act( () => {
			render( <Interval onTick={ otherSpy } period={ EVERY_SECOND } />, container );
		} );

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( otherSpy ).not.toHaveBeenCalled();

		act( () => {
			jest.advanceTimersByTime( 1000 );
		} );

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( otherSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );
