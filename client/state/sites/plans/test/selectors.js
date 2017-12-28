/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getSitePlan,
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
	getPlanRawDiscount,
	getPlansBySite,
	getPlansBySiteId,
	getCurrentPlan,
	hasDomainCredit,
	isCurrentUserCurrentPlanOwner,
	isRequestingSitePlans,
	isSitePlanDiscounted,
	getSitePlanSlug,
	hasFeature,
} from '../selectors';
import {
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	FEATURE_UNLIMITED_PREMIUM_THEMES,
	FEATURE_BUSINESS_ONBOARDING,
} from 'client/lib/plans/constants';
import { userState } from 'client/state/selectors/test/fixtures/user-state';

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

			expect( plans ).to.eql( plans2 );
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

			expect( plans ).to.eql( plans1 );
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
				expect( plan ).to.eql( null );
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
					expect( plan ).to.eql( plan1 );
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
					expect( plan ).to.eql( {} );
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
			expect( plan ).to.eql( { currentPlan: true, productSlug: 'gold' } );
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
			expect( plan ).to.eql( undefined );
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
			expect( plan ).to.eql( null );
		} );
	} );
	describe( '#getPlanRawPrice()', () => {
		test( 'should return a plan price', () => {
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
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'bronze' );
			expect( rawPrice ).to.equal( 199 );
		} );
		test( 'should return a monthly price', () => {
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
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'bronze', { isMonthly: true } );
			expect( rawPrice ).to.equal( 16.58 );
		} );
		test( 'should return raw price, if no discount is available', () => {
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
			const rawPrice = getSitePlanRawPrice( state, 77203074, 'silver', { isMonthly: false } );
			expect( rawPrice ).to.equal( 199 );
		} );
	} );
	describe( '#getPlanDiscountedRawPrice()', () => {
		test( 'should return a discount price', () => {
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
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'bronze' );
			expect( discountPrice ).to.equal( 99 );
		} );
		test( 'should return a monthly discount price', () => {
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
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'bronze', {
				isMonthly: true,
			} );
			expect( discountPrice ).to.equal( 8.25 );
		} );
		test( 'should return null, if no discount is available', () => {
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
			const discountPrice = getPlanDiscountedRawPrice( state, 77203074, 'silver', {
				isMonthly: true,
			} );
			expect( discountPrice ).to.equal( null );
		} );
	} );

	describe( '#getPlanRawDiscount()', () => {
		test( 'should return a raw discount', () => {
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

			const planRawDiscount = getPlanRawDiscount( state, 77203074, 'bronze' );

			expect( planRawDiscount ).to.equal( 100 );
		} );

		test( 'should return a monthly raw discount', () => {
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

			const planRawDiscount = getPlanRawDiscount( state, 77203074, 'bronze', { isMonthly: true } );

			expect( planRawDiscount ).to.equal( 8.33 );
		} );

		test( 'should return null, if no raw discount is available', () => {
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

			const planRawDiscount = getPlanRawDiscount( state, 77203074, 'silver', { isMonthly: true } );

			expect( planRawDiscount ).to.equal( null );
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

			expect( hasDomainCredit( state, 77203074 ) ).to.equal( true );
			expect( hasDomainCredit( state, 2916284 ) ).to.equal( false );
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

			expect( isRequestingSitePlans( state, 2916284 ) ).to.equal( true );
			expect( isRequestingSitePlans( state, 77203074 ) ).to.equal( false );
			expect( isRequestingSitePlans( state, 'unknown' ) ).to.equal( false );
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
			expect( discountPrice ).to.equal( false );
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
			expect( isDiscounted ).to.equal( true );
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
			expect( isDiscounted ).to.equal( null );
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
			expect( isCurrentUserCurrentPlanOwner( state, 2916284 ) ).to.be.false;
		} );

		test( 'should return true if user is a plan owner', () => {
			expect( isCurrentUserCurrentPlanOwner( state, 77203074 ) ).to.be.true;
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
			).to.be.null;
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
			).to.equal( PLAN_PREMIUM );
		} );
	} );

	describe( '#hasFeature()', () => {
		test( 'should return false if no siteId is given', () => {
			expect(
				hasFeature(
					{
						sites: {
							plans: {
								2916284: {
									data: [
										{
											currentPlan: true,
											productSlug: PLAN_BUSINESS,
										},
									],
								},
							},
						},
					},
					null,
					FEATURE_UNLIMITED_PREMIUM_THEMES
				)
			).to.be.false;
		} );

		test( 'should return false if no feature is given', () => {
			expect(
				hasFeature(
					{
						sites: {
							plans: {
								2916284: {
									data: [
										{
											currentPlan: true,
											productSlug: PLAN_BUSINESS,
										},
									],
								},
							},
						},
					},
					2916284
				)
			).to.be.false;
		} );

		test( 'should return false if no plan data is found for the given siteId', () => {
			expect(
				hasFeature(
					{
						sites: {
							plans: {
								2916284: {},
							},
						},
					},
					2916284,
					FEATURE_UNLIMITED_PREMIUM_THEMES
				)
			).to.be.false;
		} );

		test( "should return false if the site's current plan doesn't include the specified feature", () => {
			expect(
				hasFeature(
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
					2916284,
					FEATURE_BUSINESS_ONBOARDING
				)
			).to.be.false;
		} );

		test( "should return true if the site's current plan includes the specified feature", () => {
			expect(
				hasFeature(
					{
						sites: {
							plans: {
								2916284: {
									data: [
										{
											currentPlan: true,
											productSlug: PLAN_BUSINESS,
										},
									],
								},
							},
						},
					},
					2916284,
					FEATURE_UNLIMITED_PREMIUM_THEMES
				)
			).to.be.true;
		} );
	} );
} );
