import config from '@automattic/calypso-config';
import {
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_ECOMMERCE_3_YEARS,
} from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import moment from 'moment';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import {
	getECommerceTrialDaysLeft,
	getECommerceTrialExpiration,
	getMigrationTrialDaysLeft,
	getMigrationTrialExpiration,
	isECommerceTrialExpired,
	isMigrationTrialExpired,
	isSiteOnECommerceTrial,
	isSiteOnMigrationTrial,
	isSiteOnWooExpressEcommerceTrial,
} from '../selectors';

// Mock the config system
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn( () => true );

	return mock;
} );

// Mock the Migration Trial feature flag (plans/migration-trial)
const withTrialEnabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key === 'plans/migration-trial' );
const withTrialDisabled = () =>
	config.isEnabled.mockImplementation( ( key ) => key !== 'plans/migration-trial' );

describe( 'trials', () => {
	beforeEach( () => {
		withTrialEnabled();
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	function getState( plan, siteId ) {
		return deepFreeze( {
			...userState,
			sites: {
				plans: {
					[ siteId ]: plan ? { data: [ plan ] } : { data: [] },
				},
				items: {
					[ siteId ]: {
						URL: 'https://example.wordpress.com',
					},
				},
			},
			siteSettings: {
				items: {},
			},
		} );
	}

	function getPlan( blogId, productSlug, expiryDate ) {
		const ret = {
			ID: 1,
			productSlug,
			blogId,
			currentPlan: true,
		};

		if ( expiryDate ) {
			ret.expiryDate = expiryDate;
		}

		return ret;
	}

	describe( '#isSiteOnECommerceTrial()', () => {
		const siteId = 1337;
		test( 'Should return true when the e-commerce trial is in the purchases list', () => {
			const plan = getPlan( siteId, PLAN_ECOMMERCE_TRIAL_MONTHLY );
			const state = getState( plan, siteId );

			expect( isSiteOnECommerceTrial( state, siteId ) ).toBeTruthy();
		} );

		test( 'Should return false when the e-commerce trial is not in the purchases list', () => {
			const state = getState( null, siteId );

			expect( isSiteOnECommerceTrial( state, siteId ) ).toBeFalsy();
		} );

		test( 'Should return false when the site has a regular e-commerce plan', () => {
			const plan = getPlan( siteId, PLAN_ECOMMERCE_MONTHLY );
			const state = getState( plan, siteId );

			expect( isSiteOnECommerceTrial( state, siteId ) ).toBeFalsy();
		} );
	} );

	describe( '#isSiteOnWooExpressEcommerceTrial()', () => {
		const siteId = 1337;
		const getCustomState = ( productSlug ) => {
			return deepFreeze( {
				...userState,
				sites: {
					plans: {
						[ siteId ]: {
							data: [
								{
									ID: 1,
									productSlug: productSlug,
									blogId: siteId,
									currentPlan: true,
								},
							],
						},
					},
					items: {
						[ siteId ]: {
							URL: 'https://example.wordpress.com',
						},
					},
				},
				siteSettings: {
					items: {},
				},
			} );
		};

		test( 'Should return true when the e-commerce trial is in the purchases list', () => {
			expect(
				isSiteOnWooExpressEcommerceTrial( getCustomState( PLAN_ECOMMERCE_TRIAL_MONTHLY ), siteId )
			).toBeTruthy();
		} );

		test( 'Should return true when the e-commerce 3-year plan is in the purchases list', () => {
			expect(
				isSiteOnWooExpressEcommerceTrial( getCustomState( PLAN_ECOMMERCE_3_YEARS ), siteId )
			).toBeTruthy();
		} );

		test( 'Should return true when the Woo Express medium plan is in the purchases list', () => {
			expect(
				isSiteOnWooExpressEcommerceTrial( getCustomState( PLAN_WOOEXPRESS_MEDIUM ), siteId )
			).toBeTruthy();
		} );

		test( 'Should return true state is using site data instead of plans data', () => {
			const state = deepFreeze( {
				...userState,
				sites: {
					plans: {},
					items: {
						[ siteId ]: {
							URL: 'https://example.wordpress.com',
							plan: {
								product_slug: PLAN_WOOEXPRESS_MEDIUM,
							},
						},
					},
				},
				siteSettings: {
					items: {},
				},
			} );
			expect( isSiteOnWooExpressEcommerceTrial( state, siteId ) ).toBeTruthy();
		} );

		test( 'Should return false when site does not have relevant plan', () => {
			expect( isSiteOnWooExpressEcommerceTrial( getState( '' ), siteId ) ).toBeFalsy();
		} );
	} );

	describe( '#getECommerceTrialExpiration()', () => {
		const siteId = 1337;
		test( 'Returns the expiration date', () => {
			const expiryDate = '2022-02-10T00:00:00+00:00';
			const plan = getPlan( siteId, PLAN_ECOMMERCE_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			expect(
				getECommerceTrialExpiration( state, siteId ).isSame( moment( expiryDate ) )
			).toBeTruthy();
		} );

		test( 'Returns null when the trial purchase is not present', () => {
			const plan = {};
			const state = getState( plan, siteId );

			expect( getECommerceTrialExpiration( state, siteId ) ).toBeNull();
		} );
	} );

	describe( '#getECommerceTrialDaysLeft()', () => {
		const siteId = 1337;
		jest.useFakeTimers().setSystemTime( new Date( '2022-01-10T00:00:00+00:00' ) );

		test( 'Should return the correct number of days left before the trial expires', () => {
			const expiryDate = '2022-02-10T00:00:00+00:00';
			const plan = getPlan( siteId, PLAN_ECOMMERCE_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			expect( getECommerceTrialDaysLeft( state, siteId ) ).toBe( 31 );
		} );
	} );

	describe( '#isECommerceTrialExpired()', () => {
		const siteId = 1337;
		jest.useFakeTimers().setSystemTime( new Date( '2022-01-10T00:00:00+00:00' ) );

		test( 'The trial period should be expired', () => {
			const expiryDate = '2022-01-09T00:00:00+00:00';
			const plan = getPlan( siteId, PLAN_ECOMMERCE_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			expect( isECommerceTrialExpired( state, siteId ) ).toBeTruthy();
		} );

		test( 'The trial period should not be expired if is the same day', () => {
			const expiryDate = '2022-01-10T23:59:59+00:00';
			const plan = getPlan( siteId, PLAN_ECOMMERCE_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			expect( isECommerceTrialExpired( state, siteId ) ).toBeFalsy();
		} );
	} );

	describe( '#isSiteOnMigrationTrial()', () => {
		const siteId = 1337;
		test( 'Should return true when the migration trial is in the purchases list', () => {
			const plan = getPlan( siteId, PLAN_MIGRATION_TRIAL_MONTHLY );
			const state = getState( plan, siteId );

			withTrialEnabled();
			expect( isSiteOnMigrationTrial( state, siteId ) ).toBeTruthy();

			withTrialDisabled();
			expect( isSiteOnMigrationTrial( state, siteId ) ).toBeFalsy();
		} );

		test( 'Should return false when the migration trial is not in the purchases list', () => {
			const state = getState( null, siteId );

			expect( isSiteOnMigrationTrial( state, siteId ) ).toBeFalsy();
		} );
	} );

	describe( '#getMigrationTrialExpiration()', () => {
		const siteId = 1337;
		test( 'Returns the expiration date', () => {
			const expiryDate = '2022-02-10T00:00:00+00:00';
			const plan = getPlan( siteId, PLAN_MIGRATION_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			withTrialEnabled();
			expect(
				getMigrationTrialExpiration( state, siteId ).isSame( moment( expiryDate ) )
			).toBeTruthy();

			withTrialDisabled();
			expect( getMigrationTrialExpiration( state, siteId ) ).toBeNull();
		} );

		test( 'Returns null when the trial purchase is not present', () => {
			const plan = {};

			const state = getState( plan, siteId );

			expect( getMigrationTrialExpiration( state, siteId ) ).toBeNull();
		} );
	} );

	describe( '#getMigrationTrialDaysLeft()', () => {
		const siteId = 1337;
		jest.useFakeTimers().setSystemTime( new Date( '2022-01-10T00:00:00+00:00' ) );

		test( 'Should return the correct number of days left before the trial expires', () => {
			const expiryDate = '2022-02-10T00:00:00+00:00';
			const plan = getPlan( siteId, PLAN_MIGRATION_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			withTrialEnabled();
			expect( getMigrationTrialDaysLeft( state, siteId ) ).toBe( 31 );

			withTrialDisabled();
			expect( getMigrationTrialDaysLeft( state, siteId ) ).toBeNull();
		} );
	} );

	describe( '#isMigrationTrialExpired()', () => {
		const siteId = 1337;
		jest.useFakeTimers().setSystemTime( new Date( '2022-01-10T00:00:00+00:00' ) );

		test( 'The trial period should be expired', () => {
			const expiryDate = '2022-01-09T00:00:00+00:00';
			const plan = getPlan( siteId, PLAN_MIGRATION_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			withTrialEnabled();
			expect( isMigrationTrialExpired( state, siteId ) ).toBeTruthy();

			withTrialDisabled();
			expect( isMigrationTrialExpired( state, siteId ) ).toBeNull();
		} );

		test( 'The trial period should not be expired if is the same day', () => {
			const expiryDate = '2022-01-10T23:59:59+00:00';
			const plan = getPlan( siteId, PLAN_MIGRATION_TRIAL_MONTHLY, expiryDate );
			const state = getState( plan, siteId );

			withTrialEnabled();
			expect( isMigrationTrialExpired( state, siteId ) ).toBeFalsy();

			withTrialDisabled();
			expect( isMigrationTrialExpired( state, siteId ) ).toBeNull();
		} );
	} );
} );
