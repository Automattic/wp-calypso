import { useLayoutEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import { stopPerformanceTracking } from '../lib';
import { usePerformanceTrackerStop } from '../use-performance-tracker-stop';

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
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSectionName: jest.fn(),
} ) );

describe( 'usePerformanceTrackerStop hook', () => {
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

	it( 'calls stopPerformanceTracking with any extra collectors', () => {
		getSectionName.mockImplementation( () => 'pageName' );

		const extraCollectors = [
			( state ) => {
				return ( rep ) => {
					rep.data.set( 'stateFoo', state.foo );
				};
			},
			( _, metadata ) => ( rep ) => {
				rep.data.set( 'metadataBar', metadata.bar );
			},
		];

		usePerformanceTrackerStop( extraCollectors );

		expect( stopPerformanceTracking ).toHaveBeenCalledWith(
			'pageName',
			expect.objectContaining( { extraCollectors } )
		);
	} );

	it( 'calls stop using useLayoutEffect and requestAnimationFrame', () => {
		usePerformanceTrackerStop();

		expect( useLayoutEffect ).toHaveBeenCalled();
		expect( global.requestAnimationFrame ).toHaveBeenCalledTimes( 1 );
	} );
} );
