/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ActivityQueryManager from '..';

/**
 * Module constants
 */
const DEFAULT_ACTIVITY_PUBLISHED = '2014-09-14T00:30:00+02:00';
const DEFAULT_ACTIVITY_TS = Date.parse( DEFAULT_ACTIVITY_PUBLISHED );

// TODO: Update with wpcom/v2 style activity stream data
const DEFAULT_ACTIVITY = {
	activityId: 'foobarbaz',
	published: DEFAULT_ACTIVITY_PUBLISHED,
};

describe( 'ActivityQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new ActivityQueryManager();
	} );

	describe( '#matches()', () => {
		context( 'query.dateStart', () => {
			it( 'should return true if activity is at the specified time', () => {
				const isMatch = manager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if activity is after the specified time', () => {
				const isMatch = manager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is before the specified time', () => {
				const isMatch = manager.matches(
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
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is after the specified time', () => {
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if activity is before the specified time', () => {
				const isMatch = manager.matches(
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
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 1,
						dateStart: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is before a range of dates', () => {
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 2,
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );

			it( 'should return false if activity is after a range of dates', () => {
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
						dateStart: DEFAULT_ACTIVITY_TS - 2,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );

			it( 'should be impossible to match if dateStart is after dateEnd', () => {
				const isMatch = manager.matches(
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
			const activityA = { activityId: 'a', published: new Date( 100000 ).toISOString() };
			const activityB = { activityId: 'b', published: new Date( 200000 ).toISOString() };

			expect( [ activityA, activityB ].sort( sortFunc ) ).to.eql( [ activityB, activityA ] );
		} );

		it( 'should include simultaneous events (in any order, sort is unstable)', () => {
			const sortFunc = manager.compare.bind( manager, {} );
			const activityA = { activityId: 'a', published: new Date( 100000 ).toISOString() };
			const activityB = { activityId: 'b', published: new Date( 100000 ).toISOString() };

			expect( [ activityA, activityB ].sort( sortFunc ) ).to.include.members( [
				activityA,
				activityB,
			] );
		} );
	} );
} );
