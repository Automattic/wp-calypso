/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from 'lib/plans/constants';

/**
 * Constants
 */
const STATE = deepFreeze( {} );
const ALL_PLANS = deepFreeze( [
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
] );

const MATCHING_PLAN_PAIRS = deepFreeze( [
	[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ],
	[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ],
	[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ],
] );

const NONMATCHING_PLAN_PAIRS = deepFreeze( [
	[ PLAN_BUSINESS, PLAN_FREE ],
	[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM_MONTHLY ],
	[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL_MONTHLY ],
	[ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PREMIUM_MONTHLY ],
	[ PLAN_PERSONAL, PLAN_PREMIUM ],
] );

describe( '#isCurrentSitePlanMatch()', () => {
	let isCurrentSitePlanMatch;
	let getSitePlanSlug;
	let getPlanSlug;
	useMockery( mockery => {
		getSitePlanSlug = stub();
		mockery.registerMock( 'state/sites/selectors', { getSitePlanSlug } );

		getPlanSlug = stub();
		mockery.registerMock( 'state/plans/selectors', { getPlanSlug } );
	} );

	before( () => {
		isCurrentSitePlanMatch = require( '../is-current-site-plan-match' );
	} );

	it( 'should return null if the site is not known', () => {
		getSitePlanSlug.returns( null );
		getPlanSlug.returns( PLAN_JETPACK_BUSINESS );
		const isMatch = isCurrentSitePlanMatch( STATE, 1, 1 );
		expect( isMatch ).to.be.null;
	} );

	it( 'should return null if the plan is not known', () => {
		getSitePlanSlug.returns( PLAN_JETPACK_BUSINESS );
		getPlanSlug.returns( null );
		const isMatch = isCurrentSitePlanMatch( STATE, 1, 1 );
		expect( isMatch ).to.be.null;
	} );

	it( 'should return true if the plan is the same', () => {
		ALL_PLANS.forEach( plan => {
			getSitePlanSlug.returns( plan );
			getPlanSlug.returns( plan );
			const isMatch = isCurrentSitePlanMatch( STATE, 1, 1 );
			expect( isMatch ).to.be.true;
		} );
	} );

	it( 'should return true if the plan is the same', () => {
		MATCHING_PLAN_PAIRS.forEach( ( [ sitePlan, queriedPlan ] ) => {
			getSitePlanSlug.returns( sitePlan );
			getPlanSlug.returns( queriedPlan );
			const isMatch = isCurrentSitePlanMatch( STATE, 1, 1 );
			expect( isMatch ).to.be.true;
		} );

		MATCHING_PLAN_PAIRS.forEach( ( [ queriedPlan, sitePlan ] ) => {
			getSitePlanSlug.returns( sitePlan );
			getPlanSlug.returns( queriedPlan );
			const isMatch = isCurrentSitePlanMatch( STATE, 1, 1 );
			expect( isMatch ).to.be.true;
		} );
	} );

	it( 'should return false if the plans do not match', () => {
		NONMATCHING_PLAN_PAIRS.forEach( ( [ sitePlan, queriedPlan ] ) => {
			getSitePlanSlug.returns( sitePlan );
			getPlanSlug.returns( queriedPlan );
			const isMatch = isCurrentSitePlanMatch( STATE, 1, 1 );
			expect( isMatch ).to.be.false;
		} );

		NONMATCHING_PLAN_PAIRS.forEach( ( [ queriedPlan, sitePlan ] ) => {
			getSitePlanSlug.returns( sitePlan );
			getPlanSlug.returns( queriedPlan );
			const isMatch = isCurrentSitePlanMatch( STATE, 1, 1 );
			expect( isMatch ).to.be.false;
		} );
	} );
} );
