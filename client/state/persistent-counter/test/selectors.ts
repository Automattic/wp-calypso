import { expect } from 'chai';
import { PREFERENCE_BASE_NAME } from '../constants';
import {
	getCounterName,
	getCounter,
	getCount,
	lastUpdatedIsToday,
	counterExists,
} from '../selectors';

const TEST_SITE_ID = 123456789;
const COUNTER_NAME = 'my-test-counter';

const reduxState = {
	ui: {
		selectedSiteId: TEST_SITE_ID,
	},
};

describe( 'selectors', () => {
	describe( 'getCounterName:', () => {
		test( 'should return counter name with siteId suffixed when keyedToSiteId arg is true', () => {
			const state = {
				...reduxState,
				preferences: {},
			};
			expect( getCounterName( state, COUNTER_NAME, true ) ).to.equal(
				`${ COUNTER_NAME }-${ TEST_SITE_ID }`
			);
		} );

		test( 'should return counter name without siteId suffixed when keyedToSiteId arg is false', () => {
			const state = {
				...reduxState,
				preferences: {},
			};
			expect( getCounterName( state, COUNTER_NAME, false ) ).to.equal( `${ COUNTER_NAME }` );
		} );
	} );

	describe( 'getCounter:', () => {
		test( "should return an initial counter object (count: 0, lastUpdated: null) if counter doesn't exist", () => {
			const state = {
				...reduxState,
				preferences: {},
			};
			expect( getCounter( state, COUNTER_NAME, false ) ).to.deep.equal( {
				count: 0,
				lastUpdated: null,
			} );
		} );

		test( 'should return the preference value when the preference exists', () => {
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							[ COUNTER_NAME ]: {
								count: 5,
								lastUpdated: 1646852413406,
							},
						},
					},
				},
			};
			expect( getCounter( state, COUNTER_NAME, false ) ).to.deep.equal( {
				count: 5,
				lastUpdated: 1646852413406,
			} );
		} );

		test( 'should return the preference value when exists and keyedToSiteId arg is true', () => {
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							[ `${ COUNTER_NAME }-${ TEST_SITE_ID }` ]: {
								count: 11,
								lastUpdated: 1646852413406,
							},
						},
					},
				},
			};
			expect( getCounter( state, COUNTER_NAME, true ) ).to.deep.equal( {
				count: 11,
				lastUpdated: 1646852413406,
			} );
		} );
	} );

	describe( 'getCount:', () => {
		test( "should return undefined if preference doesn't exist", () => {
			const state = {
				...reduxState,
				preferences: {},
			};
			expect( getCount( state, COUNTER_NAME, false ) ).to.be.undefined;
		} );

		test( 'should return the correct count value if preference exist and keyedToSiteId arg is false', () => {
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							[ COUNTER_NAME ]: {
								count: 7,
								lastUpdated: 1646852413406,
							},
						},
					},
				},
			};
			expect( getCount( state, COUNTER_NAME, false ) ).to.equal( 7 );
		} );

		test( 'should return the correct count value if counter exist and keyedToSiteId arg is true', () => {
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							[ `${ COUNTER_NAME }-${ TEST_SITE_ID }` ]: {
								count: 3,
								lastUpdated: 1646852413406,
							},
						},
					},
				},
			};
			expect( getCount( state, COUNTER_NAME, true ) ).to.equal( 3 );
		} );
	} );

	describe( 'lastUpdatedIsToday:', () => {
		test( 'should return true if counter was updated today', () => {
			const today = Date.now();
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							[ COUNTER_NAME ]: {
								count: 7,
								lastUpdated: today,
							},
						},
					},
				},
			};
			expect( lastUpdatedIsToday( state, COUNTER_NAME, false ) ).to.be.true;
		} );

		test( 'should return false if counter was not updated today', () => {
			const notToday = Date.parse( '2022-03-09 07:47:05' );
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							[ COUNTER_NAME ]: {
								count: 7,
								lastUpdated: notToday,
							},
						},
					},
				},
			};
			expect( lastUpdatedIsToday( state, COUNTER_NAME, false ) ).to.be.false;
		} );
	} );

	describe( 'counterExists:', () => {
		test( 'should return true if the counter preference key exists', () => {
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							'my-counter-name': {
								count: 7,
								lastUpdated: 1646852413406,
							},
						},
					},
				},
			};
			expect( counterExists( state, 'my-counter-name', false ) ).to.be.true;
		} );

		test( 'should return false if counter preference key does not exist', () => {
			const notToday = Date.parse( '2022-03-09 07:47:05' );
			const state = {
				...reduxState,
				preferences: {
					localValues: {
						[ PREFERENCE_BASE_NAME ]: {
							'my-counter-name': {
								count: 7,
								lastUpdated: notToday,
							},
						},
					},
				},
			};
			expect( lastUpdatedIsToday( state, 'wrong-counter-name', false ) ).to.be.false;
		} );
	} );
} );
