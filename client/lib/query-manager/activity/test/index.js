/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import ActivityQueryManager from '..';

/**
 * Module constants
 */
const DEFAULT_ACTIVITY_DATE = '2014-09-14T00:30:00+02:00';
const DEFAULT_ACTIVITY_TS = Date.parse( DEFAULT_ACTIVITY_DATE );

const makeComparator = ( query ) => ( a, b ) => ActivityQueryManager.compare( query, a, b );

const DEFAULT_ACTIVITY = deepFreeze( {
	activityDate: DEFAULT_ACTIVITY_DATE,
	activityGroup: 'plugin',
	activityIcon: 'plugins',
	activityId: 'foo_bar_BaZ',
	activityName: 'plugin__activated',
	activityTitle: 'User name activated plugin My Test Plugin',
	activityTs: DEFAULT_ACTIVITY_TS,
	actorAvatarUrl: 'https://secure.gravatar.com/avatar/0?s=96&d=mm&r=g',
	actorName: 'User name',
	actorRemoteId: 345,
	actorRole: 'administrator',
	actorWpcomId: 678,
} );

describe( 'ActivityQueryManager', () => {
	describe( '#matches()', () => {
		describe( 'query.dateStart', () => {
			test( 'should return true if activity is at the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return true if activity is after the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return false if activity is before the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( false );
			} );
		} );

		describe( 'query.dateEnd', () => {
			test( 'should return true if activity is at the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return false if activity is after the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true if activity is before the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( true );
			} );
		} );

		describe( 'date range query', () => {
			test( 'should return true if activity is within a range of dates', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 1,
						dateStart: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return false if activity is before a range of dates', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 2,
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return false if activity is after a range of dates', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
						dateStart: DEFAULT_ACTIVITY_TS - 2,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should be impossible to match if dateStart is after dateEnd', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).toBe( false );
			} );
		} );
	} );

	describe( '#compare()', () => {
		test( 'should sort by timestamp descending', () => {
			const sortFunc = makeComparator( {} );
			const activityA = { activityId: 'a', activityTs: 100000 };
			const activityB = { activityId: 'b', activityTs: 200000 };

			expect( [ activityA, activityB ].sort( sortFunc ) ).toEqual( [ activityB, activityA ] );
		} );

		test( 'should include simultaneous events (in any order, sort is unstable)', () => {
			const sortFunc = makeComparator( {} );
			const activityA = { activityId: 'a', activityTs: 100000 };
			const activityB = { activityId: 'b', activityTs: 100000 };

			expect( [ activityA, activityB ].sort( sortFunc ) ).toEqual(
				expect.arrayContaining( [ activityA, activityB ] )
			);
		} );
	} );
} );
