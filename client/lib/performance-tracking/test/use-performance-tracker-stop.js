/**
 * External dependencies
 */
import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { stop } from '@automattic/browser-data-collector';

/**
 * Internal dependencies
 */
import { getSectionName } from 'state/ui/selectors';
import config from 'config';
import { usePerformanceTrackerStop } from '../use-performance-tracker-stop';

jest.mock( 'react', () => ( {
	useLayoutEffect: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );
jest.mock( '@automattic/browser-data-collector', () => ( {
	stop: jest.fn(),
} ) );
jest.mock( 'state/ui/selectors', () => ( {
	getSectionName: jest.fn(),
} ) );
jest.mock( 'config', () => ( {
	isEnabled: jest.fn(),
} ) );

const withFeatureEnabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key === 'rum-tracking/logstash' );
const withFeatureDisabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key !== 'rum-tracking/logstash' );

describe( 'usePerfomranceTrackerStop hook', () => {
	let originalRequestAnimationFrame;

	beforeEach( () => {
		originalRequestAnimationFrame = global.requestAnimationFrame;
		global.requestAnimationFrame = jest.fn( ( fn ) => fn() );
		useLayoutEffect.mockImplementation( ( fn ) => fn() );
		useSelector.mockImplementation( ( selector ) => selector() );
		withFeatureEnabled();
	} );

	afterEach( () => {
		jest.resetAllMocks();
		global.requestAnimationFrame = originalRequestAnimationFrame;
	} );

	it( 'does not stop measuring if the feature is off', () => {
		withFeatureDisabled();

		usePerformanceTrackerStop();

		expect( stop ).not.toHaveBeenCalled();
	} );

	it( 'gets the page name from the state', () => {
		getSectionName.mockImplementation( () => 'pageName' );

		usePerformanceTrackerStop();

		expect( stop ).toHaveBeenCalledWith( 'pageName' );
	} );

	it( 'calls stop using useLayoutEffect and requestAnimationFrame', () => {
		usePerformanceTrackerStop();

		expect( useLayoutEffect ).toHaveBeenCalled();
		expect( global.requestAnimationFrame ).toHaveBeenCalledTimes( 1 );
	} );
} );
