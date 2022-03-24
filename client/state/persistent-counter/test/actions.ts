import { expect } from 'chai';
import { PREFERENCE_BASE_NAME } from '../constants';
import { isSameDay, incrementPreference, decrementPreference, resetPreference } from '../helpers';

const TEST_SITE_ID = 123456789;
const COUNTER_NAME = 'my-test-counter';

describe( 'actions', () => {
	describe( 'isSameDay()', () => {
		test( 'Should return true if 2 timestamps are on the same day', () => {
			const timestamp1 = Date.parse( '2022-03-09 07:47:05' );
			const timestamp2 = Date.parse( '2022-03-09 01:00:02' );
			expect( isSameDay( timestamp1, timestamp2 ) ).to.be.true;
		} );

		test( 'Should return false if 2 timestamps are on different days', () => {
			const timestamp1 = Date.now();
			const timestamp2 = Date.parse( '2022-03-08 01:00:02' );
			expect( isSameDay( timestamp1, timestamp2 ) ).to.be.false;
		} );
	} );

	describe( 'incrementPreference()', () => {
		test( "should create new counter property if counter preference doesn't exist", () => {
			const result = incrementPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {
						localValues: {
							[ PREFERENCE_BASE_NAME ]: {
								'some-other-counter': {
									count: 99,
									lastUpdated: 1646844419200,
								},
							},
						},
					},
				},
				'my-test-counter',
				false
			);

			expect( result ).to.have.deep.own.property( 'my-test-counter' );
		} );

		test( 'should cleanly update the preferences object without affecting other values', () => {
			jest.spyOn( Date, 'now' ).mockReturnValueOnce( 9999 );

			const result = incrementPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {
						localValues: {
							[ PREFERENCE_BASE_NAME ]: {
								'some-other-counter': {
									count: 99,
									lastUpdated: 1646844419200,
								},
							},
						},
					},
				},
				'my-test-counter',
				false
			);

			expect( result ).to.deep.eql( {
				'some-other-counter': {
					count: 99,
					lastUpdated: 1646844419200,
				},
				'my-test-counter': {
					count: 1,
					lastUpdated: 9999,
				},
			} );
		} );

		test( 'should increment count to 1 on initial increment/creation', () => {
			const result = incrementPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {},
				},
				'my-test-counter',
				false
			);
			expect( result[ COUNTER_NAME ] ).to.have.own.property( 'count', 1 );
		} );

		test( 'should update lastUpdated on increment', () => {
			jest.spyOn( Date, 'now' ).mockReturnValueOnce( 9999 );

			const result = incrementPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {
						localValues: {
							[ PREFERENCE_BASE_NAME ]: {
								'my-test-counter': {
									count: 1,
									lastUpdated: 1646844419200,
								},
							},
						},
					},
				},
				'my-test-counter',
				false
			);
			expect( result[ COUNTER_NAME ] ).to.deep.eql( {
				count: 2,
				lastUpdated: 9999,
			} );
			expect( result[ COUNTER_NAME ] ).to.have.own.property( 'lastUpdated', 9999 );
		} );
	} );

	describe( 'decrementPreference()', () => {
		test( "should create new counter property if counter preference doesn't exist and set count to 0", () => {
			jest.spyOn( Date, 'now' ).mockReturnValueOnce( 9999 );
			const result = decrementPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {},
				},
				'my-test-counter',
				false
			);
			expect( result ).to.have.deep.own.property( 'my-test-counter' );
			expect( result[ COUNTER_NAME ] ).to.deep.eql( {
				count: 0,
				lastUpdated: 9999,
			} );
		} );

		test( 'counter should not decrement to negative. should force minimum 0', () => {
			jest.spyOn( Date, 'now' ).mockReturnValueOnce( 9999 );
			const result = decrementPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {
						localValues: {
							[ PREFERENCE_BASE_NAME ]: {
								'my-test-counter': {
									count: 0,
									lastUpdated: 1646844419200,
								},
							},
						},
					},
				},
				'my-test-counter',
				false
			);
			expect( result[ COUNTER_NAME ] ).to.deep.eql( {
				count: 0,
				lastUpdated: 9999,
			} );
		} );

		test( 'should update lastUpdated on decrement', () => {
			jest.spyOn( Date, 'now' ).mockReturnValueOnce( 9999 );

			const result = decrementPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {
						localValues: {
							[ PREFERENCE_BASE_NAME ]: {
								'my-test-counter': {
									count: 1,
									lastUpdated: 1646844419200,
								},
							},
						},
					},
				},
				'my-test-counter',
				false
			);
			expect( result[ COUNTER_NAME ] ).to.deep.eql( {
				count: 0,
				lastUpdated: 9999,
			} );
			expect( result[ COUNTER_NAME ] ).to.have.own.property( 'lastUpdated', 9999 );
		} );
	} );

	describe( 'resetPreference()', () => {
		test( 'should reset the counter preference to count: 0 and lastUpdated: null', () => {
			const result = resetPreference(
				{
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {
						localValues: {
							[ PREFERENCE_BASE_NAME ]: {
								'my-test-counter': {
									count: 8,
									lastUpdated: 1646844419200,
								},
							},
						},
					},
				},
				'my-test-counter',
				false
			);
			expect( result[ COUNTER_NAME ] ).to.deep.eql( {
				count: 0,
				lastUpdated: null,
			} );
		} );
	} );
} );
