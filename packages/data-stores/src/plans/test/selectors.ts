/**
 * Internal dependencies
 */
import {
	getPlanByPath,
	getSupportedPlans,
	getPlansPaths,
	getCorrespondingPlanFromOtherInterval,
} from '../selectors';

import { State } from '../reducer';

import { PLAN_FREE, PLAN_PREMIUM, PLAN_PREMIUM_MONTHLY } from '../constants';

const DEFAULT_STATE: State = {
	plans: {
		[ PLAN_FREE ]: {
			title: 'free plan',
			description: 'it is free',
			productId: 1,
			storeSlug: PLAN_FREE,
			pathSlug: 'free',
			features: [],
			isFree: true,
			price: '0',
			rawPrice: 0,
		},
		[ PLAN_PREMIUM ]: {
			title: 'premium plan',
			description: 'it is premium',
			productId: 2,
			storeSlug: PLAN_PREMIUM,
			pathSlug: 'premium',
			features: [],
			billPeriod: 'ANNUALLY',
			price: '12',
			rawPrice: 0,
		},
		[ PLAN_PREMIUM_MONTHLY ]: {
			title: 'premium plan',
			description: 'it is premium',
			productId: 3,
			storeSlug: PLAN_PREMIUM_MONTHLY,
			pathSlug: 'premium-monthly',
			features: [],
			billPeriod: 'MONTHLY',
			price: '1',
			rawPrice: 0,
		},
	},
	features: {},
	featuresByType: [],
};

describe( 'getSupportedPlans', () => {
	it( 'Should return all plans if no period is defined', () => {
		const supportedPlans = getSupportedPlans( DEFAULT_STATE );

		expect( supportedPlans ).toEqual( Object.values( DEFAULT_STATE.plans ) );
	} );

	it( 'always includes free plan - monthly', () => {
		const supportedPlans = getSupportedPlans( DEFAULT_STATE, '', 'MONTHLY' );

		expect( supportedPlans ).toContain( DEFAULT_STATE.plans[ PLAN_FREE ] );
	} );
	it( 'always includes free plan - annually', () => {
		const supportedPlans = getSupportedPlans( DEFAULT_STATE, '', 'ANNUALLY' );

		expect( supportedPlans ).toContain( DEFAULT_STATE.plans[ PLAN_FREE ] );
	} );

	it( 'only includes monthly plans for MONTHLY period', () => {
		const supportedPlans = getSupportedPlans( DEFAULT_STATE, '', 'MONTHLY' );
		expect( supportedPlans ).toEqual( [
			DEFAULT_STATE.plans[ PLAN_FREE ],
			DEFAULT_STATE.plans[ PLAN_PREMIUM_MONTHLY ],
		] );
	} );

	it( 'only includes yearly plans for ANNUAL period', () => {
		const supportedPlans = getSupportedPlans( DEFAULT_STATE, '', 'ANNUALLY' );
		expect( supportedPlans ).toEqual( [
			DEFAULT_STATE.plans[ PLAN_FREE ],
			DEFAULT_STATE.plans[ PLAN_PREMIUM ],
		] );
	} );
} );

describe( 'getPlanByPath', () => {
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
