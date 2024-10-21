import { PLAN_PREMIUM } from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import {
	getCurrentPlan,
	getPlansBySite,
	getPlansBySiteId,
	getSitePlan,
	getSitePlanSlug,
	hasDomainCredit,
	isCurrentUserCurrentPlanOwner,
	isRequestingSitePlans,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPlansBySite()', () => {
		test( 'should return plans by site', () => {
			const plans1 = {
				data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true } ],
			};
			const plans2 = {
				data: [ { currentPlan: true }, { currentPlan: false }, { currentPlan: false } ],
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2,
					},
				},
			};
			const plans = getPlansBySite( state, { ID: 77203074 } );

			expect( plans ).toEqual( plans2 );
		} );
	} );
	describe( '#getPlansBySiteId()', () => {
		test( 'should return plans by site id', () => {
			const plans1 = {
				data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true } ],
			};
			const plans2 = {
				data: [ { currentPlan: true }, { currentPlan: false }, { currentPlan: false } ],
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2,
					},
				},
			};
			const plans = getPlansBySiteId( state, 2916284 );

			expect( plans ).toEqual( plans1 );
		} );
	} );
	describe( '#getCurrentPlan()', () => {
		describe( 'when no plan data is found for the given siteId', () => {
			const siteId = 77203074;
			const state = deepFreeze( {
				...userState,
				sites: {
					plans: {
						[ siteId ]: {},
					},
				},
			} );

			test( 'returns null', () => {
				const plan = getCurrentPlan( state, siteId );
				expect( plan ).toBeNull();
			} );
		} );

		describe( 'when plans are found for the given siteId', () => {
			describe( "when those plans include a 'currentPlan'", () => {
				const siteId = 77203074;
				const plan1 = { currentPlan: true };
				const state = deepFreeze( {
					...userState,
					sites: {
						plans: {
							[ siteId ]: {
								data: [ plan1 ],
							},
						},
						items: {
							[ siteId ]: {
								URL: 'https://example.wordpress.com',
							},
						},
					},
				} );

				test( 'returns the currentPlan', () => {
					const plan = getCurrentPlan( state, siteId );
					expect( plan ).toEqual( plan1 );
				} );
			} );

			describe( "when those plans do not include a 'currentPlan'", () => {
				const siteId = 77203074;
				const plan1 = { currentPlan: false };
				const state = deepFreeze( {
					...userState,
					sites: {
						plans: {
							[ siteId ]: {
								data: [ plan1 ],
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

				test( 'returns a new sitePlanObject', () => {
					const plan = getCurrentPlan( state, siteId );
					expect( plan ).toEqual( {} );
				} );
			} );
		} );
	} );
	describe( '#getSitePlan()', () => {
		test( 'should return plans by site and plan slug', () => {
			const plans1 = {
				data: [
					{
						currentPlan: false,
						productSlug: 'gold',
					},
					{
						currentPlan: false,
						productSlug: 'silver',
					},
					{ currentPlan: true, productSlug: 'bronze' },
				],
			};

			const plans2 = {
				data: [
					{
						currentPlan: true,
						productSlug: 'gold',
					},
					{
						currentPlan: false,
						productSlug: 'silver',
					},
					{ currentPlan: false, productSlug: 'bronze' },
				],
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2,
					},
				},
			};
			const plan = getSitePlan( state, 77203074, 'gold' );
			expect( plan ).toEqual( { currentPlan: true, productSlug: 'gold' } );
		} );
		test( 'should return falsey when plan is not found', () => {
			const plans1 = {
				data: [
					{
						currentPlan: false,
						productSlug: 'gold',
					},
					{
						currentPlan: false,
						productSlug: 'silver',
					},
					{
						currentPlan: true,
						productSlug: 'bronze',
					},
				],
			};
			const plans2 = {
				data: [
					{
						currentPlan: true,
						productSlug: 'gold',
					},
					{
						currentPlan: false,
						productSlug: 'silver',
					},
					{
						currentPlan: false,
						productSlug: 'bronze',
					},
				],
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2,
					},
				},
			};
			const plan = getSitePlan( state, 77203074, 'circle' );
			expect( plan ).toBeUndefined();
		} );
		test( 'should return falsey when siteId is not found', () => {
			const plans1 = {
				data: [
					{
						currentPlan: false,
						productSlug: 'gold',
					},
					{
						currentPlan: false,
						productSlug: 'silver',
					},
					{
						currentPlan: true,
						productSlug: 'bronze',
					},
				],
			};
			const state = {
				sites: {
					plans: {
						2916284: plans1,
					},
				},
			};
			const plan = getSitePlan( state, 77203074, 'gold' );
			expect( plan ).toBeNull();
		} );
	} );

	describe( '#hasDomainCredit()', () => {
		test( 'should return true if plan has domain credit', () => {
			const state = {
				sites: {
					plans: {
						2916284: {
							data: [
								{ currentPlan: false },
								{ currentPlan: false },
								{ currentPlan: true, hasDomainCredit: false },
							],
						},
						77203074: {
							data: [
								{ currentPlan: false },
								{ currentPlan: true, hasDomainCredit: true },
								{ currentPlan: false },
							],
						},
					},
				},
			};

			expect( hasDomainCredit( state, 77203074 ) ).toEqual( true );
			expect( hasDomainCredit( state, 2916284 ) ).toEqual( false );
		} );
	} );
	describe( '#isRequestingSitePlans()', () => {
		test( 'should return true if we are fetching plans', () => {
			const state = {
				sites: {
					plans: {
						2916284: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: true,
						},
						77203074: {
							data: null,
							error: null,
							hasLoadedFromServer: false,
							isRequesting: false,
						},
					},
				},
			};

			expect( isRequestingSitePlans( state, 2916284 ) ).toEqual( true );
			expect( isRequestingSitePlans( state, 77203074 ) ).toEqual( false );
			expect( isRequestingSitePlans( state, 'unknown' ) ).toEqual( false );
		} );
	} );

	describe( '#isCurrentUserCurrentPlanOwner()', () => {
		const state = {
			sites: {
				plans: {
					2916284: {
						data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true } ],
					},
					77203074: {
						data: [
							{ currentPlan: false },
							{ currentPlan: true, userIsOwner: true },
							{ currentPlan: false },
						],
					},
				},
			},
		};

		test( 'should return false if user is not a plan owner', () => {
			expect( isCurrentUserCurrentPlanOwner( state, 2916284 ) ).toBe( false );
		} );

		test( 'should return true if user is a plan owner', () => {
			expect( isCurrentUserCurrentPlanOwner( state, 77203074 ) ).toBe( true );
		} );
	} );

	describe( '#getSitePlanSlug()', () => {
		test( 'should return null if no plan data is found for the given siteId', () => {
			expect(
				getSitePlanSlug(
					{
						sites: {
							plans: {
								2916284: {},
							},
						},
					},
					2916284
				)
			).toBeNull();
		} );

		test( "should return the given site's current plan's product slug", () => {
			expect(
				getSitePlanSlug(
					{
						sites: {
							plans: {
								2916284: {
									data: [
										{
											currentPlan: true,
											productSlug: PLAN_PREMIUM,
										},
									],
								},
							},
						},
					},
					2916284
				)
			).toEqual( PLAN_PREMIUM );
		} );
	} );
} );
