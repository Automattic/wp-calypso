/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
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

// TODO: Update with wpcom/v2 style activity stream data
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
	let manager;
	beforeEach( () => {
		manager = new ActivityQueryManager();
	} );

	describe( '#matches()', () => {
		context( 'query.dateStart', () => {
			it( 'should return true if activity is at the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if activity is after the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is before the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );
		} );

		context( 'query.dateEnd', () => {
			it( 'should return true if activity is at the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is after the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if activity is before the specified time', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );
		} );

		context( 'date range query', () => {
			it( 'should return true if activity is within a range of dates', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 1,
						dateStart: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is before a range of dates', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 2,
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if activity is after a range of dates', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
						dateStart: DEFAULT_ACTIVITY_TS - 2,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );

			it( 'should be impossible to match if dateStart is after dateEnd', () => {
				const isMatch = ActivityQueryManager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );
		} );
	} );

	describe( '#compare()', () => {
		it( 'should sort by timestamp descending', () => {
			const sortFunc = manager.compare.bind( manager, {} );
			const activityA = { activityId: 'a', activityTs: 100000 };
			const activityB = { activityId: 'b', activityTs: 200000 };

			expect( [ activityA, activityB ].sort( sortFunc ) ).to.eql( [ activityB, activityA ] );
		} );

		it( 'should include simultaneous events (in any order, sort is unstable)', () => {
			const sortFunc = manager.compare.bind( manager, {} );
			const activityA = { activityId: 'a', activityTs: 100000 };
			const activityB = { activityId: 'b', activityTs: 100000 };

			expect( [ activityA, activityB ].sort( sortFunc ) ).to.include.members( [
				activityA,
				activityB,
			] );
		} );
	} );
} );
