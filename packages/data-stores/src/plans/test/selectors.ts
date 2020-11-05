/**
 * Internal dependencies
 */
import { getPlanByPath, getSupportedPlans, getPlansPaths } from '../selectors';
import { State } from '../reducer';
import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '../constants';

const DEFAULT_PRICES_STATE = {
	[ PLAN_FREE ]: '',
	[ PLAN_PERSONAL ]: '',
	[ PLAN_PREMIUM ]: '',
	[ PLAN_BUSINESS ]: '',
	[ PLAN_ECOMMERCE ]: '',
};

const DEFAULT_STATE: State = {
	supportedPlanSlugs: [ PLAN_FREE, PLAN_PREMIUM ],
	plans: {
		[ PLAN_FREE ]: {
			title: 'free plan',
			description: 'it is free',
			productId: 1,
			storeSlug: PLAN_FREE,
			pathSlug: 'free',
			features: [],
		},
		[ PLAN_PREMIUM ]: {
			title: 'premium plan',
			description: 'it is premium',
			productId: 2,
			storeSlug: PLAN_PREMIUM,
			pathSlug: 'premium',
			features: [],
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

		expect( paths.sort() ).toEqual( [ 'free', 'premium' ].sort() );
	} );
} );
