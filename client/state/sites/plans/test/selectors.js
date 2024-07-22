import { PLAN_PREMIUM } from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import {
	getCurrentPlan,
	getPlanDiscountedRawPrice,
	getPlansBySite,
	getPlansBySiteId,
	getSitePlan,
	getSitePlanRawPrice,
	getSitePlanSlug,
	hasDomainCredit,
	isCurrentUserCurrentPlanOwner,
	isRequestingSitePlans,
	isSitePlanDiscounted,
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
	describe( '#getSitePlanRawPrice()', () => {
		const plans = {
			data: [
				{
					currentPlan: false,
					productSlug: 'business-bundle',
					rawPrice: 299,
					rawDiscount: 0,
				},
				{
					currentPlan: false,
					productSlug: 'value_bundle',
					rawPrice: 199,
					rawDiscount: 0,
				},
				{
					currentPlan: true,
					productSlug: 'personal-bundle',
					rawPrice: 99,
					rawDiscount: 100,
				},
				{
					currentPlan: false,
					productSlug: 'value_bundle-2y',
					rawPrice: 240,
					rawDiscount: 24,
				},
				{
					currentPlan: false,
					productSlug: 'jetpack_premium_monthly',
					rawPrice: 30,
					rawDiscount: 10,
				},
			],
		};
		const state = {
			sites: {
				plans: {
					77203074: plans,
				},
			},
		};
		test( 'should return a plan price', () => {
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'personal-bundle' );
			expect( rawPrice ).toEqual( 199 );
		} );
		test( 'should return a monthly price - annual term', () => {
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'personal-bundle', {
				returnMonthly: true,
			} );
			expect( rawPrice ).toEqual( 16.58 );
		} );
		test( 'should return a monthly price - biennial term', () => {
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'value_bundle-2y', {
				returnMonthly: true,
			} );
			expect( rawPrice ).toEqual( 11 );
		} );
		test( 'should return a monthly price - monthly term', () => {
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'jetpack_premium_monthly', {
				returnMonthly: true,
			} );
			expect( rawPrice ).toEqual( 40 );
		} );
		test( 'should return raw price, if no discount is available', () => {
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'value_bundle', {
				returnMonthly: false,
			} );
			expect( rawPrice ).toEqual( 199 );
		} );
	} );
	describe( '#getPlanDiscountedRawPrice()', () => {
		const plans = {
			data: [
				{
					currentPlan: false,
					productSlug: 'business-bundle',
					rawPrice: 299,
					rawDiscount: 0,
				},
				{
					currentPlan: false,
					productSlug: 'value_bundle',
					rawPrice: 199,
					rawDiscount: 0,
				},
				{
					currentPlan: true,
					productSlug: 'personal-bundle',
					rawPrice: 99,
					rawDiscount: 100,
				},
				{
					currentPlan: false,
					productSlug: 'value_bundle-2y',
					rawPrice: 240,
					rawDiscount: 24,
				},
				{
					currentPlan: false,
					productSlug: 'jetpack_premium_monthly',
					rawPrice: 30,
					rawDiscount: 10,
				},
				{
					currentPlan: false,
					productSlug: 'jetpack_security',
					rawPrice: 30,
					rawDiscount: 0,
				},
			],
		};
		const state = {
			sites: {
				plans: {
					77203074: plans,
				},
			},
		};

		test( 'should return a discount price', () => {
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'personal-bundle' );
			expect( discountPrice ).toEqual( 99 );
		} );
		test( 'should return a monthly discount price - annual term', () => {
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'personal-bundle', {
				returnMonthly: true,
			} );
			expect( discountPrice ).toEqual( 8.25 );
		} );
		test( 'should return a monthly discount price - biennial term', () => {
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'value_bundle-2y', {
				returnMonthly: true,
			} );
			expect( discountPrice ).toEqual( 10 );
		} );
		test( 'should return a monthly discount price - monthly term (returnMonthly: true)', () => {
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'jetpack_premium_monthly', {
				returnMonthly: true,
			} );
			expect( discountPrice ).toEqual( 30 );
		} );
		test( 'should return a monthly discount price - monthly term (returnMonthly: false)', () => {
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'jetpack_premium_monthly', {
				returnMonthly: false,
			} );
			expect( discountPrice ).toEqual( 30 );
		} );
		test( 'should return null, if no discount is available', () => {
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'value_bundle', {
				returnMonthly: true,
			} );
			expect( discountPrice ).toBeNull();
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
	describe( '#isPlanDiscounted', () => {
		test( 'should return false, if no discount is available', () => {
			const plans = {
				data: [
					{
						currentPlan: false,
						productSlug: 'gold',
						rawPrice: 299,
						rawDiscount: 0,
					},
					{
						currentPlan: false,
						productSlug: 'silver',
						rawPrice: 199,
						rawDiscount: 0,
					},
					{
						currentPlan: true,
						productSlug: 'bronze',
						rawPrice: 99,
						rawDiscount: 100,
					},
				],
			};
			const state = {
				sites: {
					plans: {
						77203074: plans,
					},
				},
			};
			const discountPrice = isSitePlanDiscounted( state, 77203074, 'silver' );
			expect( discountPrice ).toEqual( false );
		} );
		test( 'should return true, if discount is available', () => {
			const plans = {
				data: [
					{
						currentPlan: false,
						productSlug: 'gold',
						rawPrice: 299,
						rawDiscount: 0,
					},
					{
						currentPlan: false,
						productSlug: 'silver',
						rawPrice: 199,
						rawDiscount: 0,
					},
					{
						currentPlan: true,
						productSlug: 'bronze',
						rawPrice: 99,
						rawDiscount: 100,
					},
				],
			};
			const state = {
				sites: {
					plans: {
						77203074: plans,
					},
				},
			};
			const isDiscounted = isSitePlanDiscounted( state, 77203074, 'bronze' );
			expect( isDiscounted ).toEqual( true );
		} );
		test( 'should return null, if plan is unknown', () => {
			const plans = {
				data: [
					{
						currentPlan: false,
						productSlug: 'gold',
						rawPrice: 299,
						rawDiscount: 0,
					},
					{
						currentPlan: false,
						productSlug: 'silver',
						rawPrice: 199,
						rawDiscount: 0,
					},
					{
						currentPlan: true,
						productSlug: 'bronze',
						rawPrice: 99,
						rawDiscount: 100,
					},
				],
			};
			const state = {
				sites: {
					plans: {
						77203074: plans,
					},
				},
			};
			const isDiscounted = isSitePlanDiscounted( state, 77203074, 'diamond' );
			expect( isDiscounted ).toBeNull();
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
