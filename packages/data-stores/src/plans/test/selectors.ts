/**
 * Internal dependencies
 */
import {
	getPlanByPath,
	getSupportedPlans,
	getPeriodSupportedPlans,
	getPlansPaths,
	getCorrespondingPlanFromOtherInterval,
} from '../selectors';

import { State } from '../reducer';

import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
} from '../constants';

const DEFAULT_PRICES_STATE = {
	[ PLAN_FREE ]: '',
	[ PLAN_PERSONAL ]: '',
	[ PLAN_PREMIUM ]: '',
	[ PLAN_BUSINESS ]: '',
	[ PLAN_ECOMMERCE ]: '',
};

const DEFAULT_STATE: State = {
	supportedPlanSlugs: [ PLAN_FREE, PLAN_PREMIUM, PLAN_PREMIUM_MONTHLY ],
	discounts: { maxDiscount: 0 },
	plans: {
		[ PLAN_FREE ]: {
			title: 'free plan',
			description: 'it is free',
			productId: 1,
			storeSlug: PLAN_FREE,
			pathSlug: 'free',
			features: [],
			isFree: true,
		},
		[ PLAN_PREMIUM ]: {
			title: 'premium plan',
			description: 'it is premium',
			productId: 2,
			storeSlug: PLAN_PREMIUM,
			pathSlug: 'premium',
			features: [],
			billPeriod: 'ANNUALLY',
		},
		[ PLAN_PREMIUM_MONTHLY ]: {
			title: 'premium plan',
			description: 'it is premium',
			productId: 3,
			storeSlug: PLAN_PREMIUM_MONTHLY,
			pathSlug: 'premium-monthly',
			features: [],
			billPeriod: 'MONTHLY',
		},
	},
	prices: DEFAULT_PRICES_STATE,
	features: {},
	featuresByType: [],
};

describe( 'getSupportedPlans', () => {
	it( 'excludes all plans if none are supported', () => {
		const supportedPlans = getSupportedPlans( { ...DEFAULT_STATE, supportedPlanSlugs: [] } );

		expect( supportedPlans ).toEqual( [] );
	} );

	it( 'excludes all plans except the one listed in supportedPlanSlugs', () => {
		const supportedPlans = getSupportedPlans( {
			...DEFAULT_STATE,
			supportedPlanSlugs: [ PLAN_FREE ],
		} );

		expect( supportedPlans ).toEqual( [ DEFAULT_STATE.plans[ PLAN_FREE ] ] );
	} );
} );

describe( 'getPeriodSupportedPlans', () => {
	it( 'always includes free plan - default period value (annually)', () => {
		const supportedPlans = getPeriodSupportedPlans( DEFAULT_STATE );

		expect( supportedPlans ).toContain( DEFAULT_STATE.plans[ PLAN_FREE ] );
	} );
	it( 'always includes free plan - annually', () => {
		const supportedPlans = getPeriodSupportedPlans( DEFAULT_STATE, 'ANNUALLY' );

		expect( supportedPlans ).toContain( DEFAULT_STATE.plans[ PLAN_FREE ] );
	} );
	it( 'always includes free plan - monthly', () => {
		const supportedPlans = getPeriodSupportedPlans( DEFAULT_STATE, 'MONTHLY' );

		expect( supportedPlans ).toContain( DEFAULT_STATE.plans[ PLAN_FREE ] );
	} );

	it( 'only includes monthly plans for MONTHLY period', () => {
		const supportedPlans = getPeriodSupportedPlans( DEFAULT_STATE, 'MONTHLY' );
		expect( supportedPlans ).toEqual( [
			DEFAULT_STATE.plans[ PLAN_FREE ],
			DEFAULT_STATE.plans[ PLAN_PREMIUM_MONTHLY ],
		] );
	} );

	it( 'only includes yearly plans for ANNUAL period', () => {
		const supportedPlans = getPeriodSupportedPlans( DEFAULT_STATE, 'ANNUALLY' );
		expect( supportedPlans ).toEqual( [
			DEFAULT_STATE.plans[ PLAN_FREE ],
			DEFAULT_STATE.plans[ PLAN_PREMIUM ],
		] );
	} );
} );

describe( 'getPlanByPath', () => {
	it( 'does not return unsupported plans', () => {
		const state = { ...DEFAULT_STATE, supportedPlanSlugs: [] };
		const plan = getPlanByPath( state, 'free' );

		expect( plan ).toBeUndefined();
	} );

	it( 'returns undefined when the path is missing', () => {
		const plan = getPlanByPath( DEFAULT_STATE, '' );

		expect( plan ).toBeUndefined();
	} );

	it( 'returns the plan when the path matches', () => {
		const plan = getPlanByPath( DEFAULT_STATE, 'free' );

		expect( plan.pathSlug ).toBe( 'free' );
	} );

	it( 'returns undefined when the path matches no plans', () => {
		const plan = getPlanByPath( DEFAULT_STATE, 'invalid path' );

		expect( plan ).toBeUndefined();
	} );
} );

describe( 'getPlansPaths', () => {
	it( 'does not return unsupported plans', () => {
		const state = { ...DEFAULT_STATE, supportedPlanSlugs: [] };
		const paths = getPlansPaths( state );

		expect( paths ).toEqual( [] );
	} );

	it( 'returns the paths of supported plans', () => {
		const paths = getPlansPaths( DEFAULT_STATE );

		expect( paths.sort() ).toEqual( [ 'free', 'premium', 'premium-monthly' ].sort() );
	} );
} );

describe( 'getCorrespondingPlanFromOtherInterval', () => {
	it( 'should return free plan when passed free plan', () => {
		const correspondingPlan = getCorrespondingPlanFromOtherInterval(
			DEFAULT_STATE,
			DEFAULT_STATE.plans[ PLAN_FREE ]
		);

		expect( correspondingPlan ).toEqual( DEFAULT_STATE.plans[ PLAN_FREE ] );
	} );
	it( 'should return annual premium plan when passed monthly premium plan', () => {
		const correspondingPlan = getCorrespondingPlanFromOtherInterval(
			DEFAULT_STATE,
			DEFAULT_STATE.plans[ PLAN_PREMIUM_MONTHLY ]
		);

		expect( correspondingPlan ).toEqual( DEFAULT_STATE.plans[ PLAN_PREMIUM ] );
	} );

	it( 'should return monthly premium plan when passed annual premium plan', () => {
		const correspondingPlan = getCorrespondingPlanFromOtherInterval(
			DEFAULT_STATE,
			DEFAULT_STATE.plans[ PLAN_PREMIUM ]
		);

		expect( correspondingPlan ).toEqual( DEFAULT_STATE.plans[ PLAN_PREMIUM_MONTHLY ] );
	} );
} );
