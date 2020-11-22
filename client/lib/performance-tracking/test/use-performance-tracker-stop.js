/**
 * External dependencies
 */
import { useLayoutEffect } from 'react';
import { useSelector, useStore } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSectionName } from 'calypso/state/ui/selectors';
import { usePerformanceTrackerStop } from '../use-performance-tracker-stop';
import { stopPerformanceTracking } from '../lib';

jest.mock( 'react', () => ( {
	useLayoutEffect: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
	useStore: jest.fn(),
} ) );
jest.mock( '../lib', () => ( {
	stopPerformanceTracking: jest.fn(),
} ) );
jest.mock( 'state/ui/selectors', () => ( {
	getSectionName: jest.fn(),
} ) );

describe( 'usePerfomranceTrackerStop hook', () => {
	let originalRequestAnimationFrame;

	beforeEach( () => {
		originalRequestAnimationFrame = global.requestAnimationFrame;
		global.requestAnimationFrame = jest.fn( ( fn ) => fn() );
		useLayoutEffect.mockImplementation( ( fn ) => fn() );
		useSelector.mockImplementation( ( selector ) => selector() );
		useStore.mockImplementation( () => ( {
			getState: jest.fn( () => ( {} ) ),
		} ) );
	} );

	afterEach( () => {
		jest.resetAllMocks();
		global.requestAnimationFrame = originalRequestAnimationFrame;
	} );

	it( 'gets the page name from the state', () => {
		getSectionName.mockImplementation( () => 'pageName' );

		usePerformanceTrackerStop();

		expect( stopPerformanceTracking ).toHaveBeenCalledWith( 'pageName', expect.anything() );
	} );

	it( 'calls stop using useLayoutEffect and requestAnimationFrame', () => {
		usePerformanceTrackerStop();

		expect( useLayoutEffect ).toHaveBeenCalled();
		expect( global.requestAnimationFrame ).toHaveBeenCalledTimes( 1 );
	} );
} );
