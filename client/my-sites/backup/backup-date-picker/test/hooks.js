/**
 * Mock dependencies
 */
jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useCallback: jest.fn( ( fn ) => fn ),
} ) );
jest.mock( 'calypso/components/localized-moment' );
jest.mock( 'calypso/my-sites/backup/hooks' );

/**
 * External dependencies
 */
import moment from 'moment';
import { useCallback } from 'react';

/**
 * Internal dependencies
 */
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDateWithOffset } from 'calypso/my-sites/backup/hooks';
import { useCanGoToDate } from '../hooks';

describe( 'useCanGoToDate', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useCallback.mockImplementation( ( fn ) => fn );
		useLocalizedMoment.mockImplementation( () => moment );
		useDateWithOffset.mockImplementation( ( d ) => d );
	} );

	test( 'Allows both forward and backward navigation between the oldest date and the present (inclusive)', () => {
		const today = moment();
		const aDayAgo = moment( today ).subtract( 1, 'day' );
		const aWeekAgo = moment( today ).subtract( 1, 'week' );
		const threeMonthsAgo = moment( today ).subtract( 3, 'months' );
		const aYearAgo = moment( today ).subtract( 1, 'year' );

		// The selected date is a week before now;
		// the furthest back we can go is a year before now,
		// and the furthest forward is, of course, the present
		const canGoToDate = useCanGoToDate( aWeekAgo, aYearAgo );

		expect( canGoToDate( today ) ).toEqual( true );
		expect( canGoToDate( aDayAgo ) ).toEqual( true );
		expect( canGoToDate( threeMonthsAgo ) ).toEqual( true );
		expect( canGoToDate( aYearAgo ) ).toEqual( true );
	} );

	test( "Allows only backward navigation if we're in the future", () => {
		const oneWeekInTheFuture = moment().add( 1, 'week' );

		const thePreviousDay = moment( oneWeekInTheFuture ).subtract( 1, 'day' );
		const theNextDay = moment( oneWeekInTheFuture ).add( 1, 'day' );

		// The selected date is currently one week in the future... somehow.
		// Really this should never happen, but sometimes people try to
		// play around by changing the browser URL, etc.
		const canGoToDate = useCanGoToDate( oneWeekInTheFuture );

		// We can move in the correct direction (backward) toward a valid date,
		// but no further away (forward) than we are right now.
		expect( canGoToDate( thePreviousDay ) ).toEqual( true );
		expect( canGoToDate( theNextDay ) ).toEqual( false );
	} );

	test( "Allows only forward navigation if we're further back than the oldest date", () => {
		const oldestDate = moment( '2011-05-21' );

		const aWeekBeforeThat = moment( oldestDate ).subtract( 1, 'week' );
		const thePreviousDay = moment( aWeekBeforeThat ).subtract( 1, 'day' );
		const theNextDay = moment( aWeekBeforeThat ).add( 1, 'day' );

		// The selected date is currently one week prior to the oldest valid
		// date... somehow. Really this should never happen, but sometimes
		// people try to play around by changing the browser URL, etc.
		const canGoToDate = useCanGoToDate( aWeekBeforeThat, oldestDate );

		// We can move in the correct direction (forward) toward a valid date,
		// but no further away (backward) than we are right now.
		expect( canGoToDate( thePreviousDay ) ).toEqual( false );
		expect( canGoToDate( theNextDay ) ).toEqual( true );
	} );

	test( 'Does not allow forward navigation to dates in the future', () => {
		const anArbitraryDate = moment( '2011-05-21' );

		const today = moment();
		const tomorrow = moment( today ).add( 1, 'day' );

		// No matter what the currently selected date is,
		// if we're inside the valid range of dates (oldestAvailable to now),
		// navigation into the future isn't allowed
		const canGoToDate = useCanGoToDate( anArbitraryDate );

		expect( canGoToDate( today ) ).toEqual( true );
		expect( canGoToDate( tomorrow ) ).toEqual( false );
	} );

	test( 'Does not allow backward navigation prior to the oldest date available', () => {
		const today = moment();
		const oneWeekAgo = moment( today ).subtract( 1, 'week' );
		const aDayBeforeThat = moment( oneWeekAgo ).subtract( 1, 'day' );

		// The currently selected date is today,
		// and we can go as far back as a week;
		// if we attempt to go back any further,
		// the function should return false
		const canGoToDate = useCanGoToDate( today, oneWeekAgo );

		expect( canGoToDate( oneWeekAgo ) ).toEqual( true );
		expect( canGoToDate( aDayBeforeThat ) ).toEqual( false );
	} );

	test( 'Always allows backward navigation if no oldest date is known', () => {
		const theUnixEpoch = moment( 0 );

		const canGoToDate = useCanGoToDate( moment() );

		expect( canGoToDate( theUnixEpoch ) ).toEqual( true );
	} );
} );
