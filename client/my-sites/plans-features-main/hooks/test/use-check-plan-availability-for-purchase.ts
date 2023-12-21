/**
 * @jest-environment jsdom
 */
/**
 * Default mock implementations
 */
jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	Plans: {
		useCurrentPlan: jest.fn(),
	},
} ) );

import { PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import useCheckPlanAvailabilityForPurchase from '../use-check-plan-availability-for-purchase';

describe( 'useCheckPlanAvailabilityForPurchase', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		Plans.useCurrentPlan.mockImplementation( () => ( { [ PLAN_PREMIUM ]: {} } ) );
	} );

	describe( 'when a site is selected', () => {
		const selectedSiteId = 123123;

		describe( 'and the selected site is on a lower tier plan', () => {
			const freePlan = {
				expired: false,
				is_free: true,
				product_id: 1,
				product_name_short: 'Free',
				product_slug: PLAN_FREE,
				user_is_owner: false,
			};

			describe( 'and the plan being evaluated is a higher tier plan', () => {
				it( 'marks the plan as available for purchase', () => {
					useSelector.mockImplementation( ( selector ) =>
						selector( {
							ui: { selectedSiteId },
							sites: {
								items: {
									123123: { plan: freePlan },
								},
								plans: {
									[ selectedSiteId ]: {
										data: [
											{
												productName: 'WordPress.com Free',
												productSlug: PLAN_FREE,
												currentPlan: true,
												userIsOwner: true,
											},
											{
												productName: 'WordPress.com Business',
												productSlug: PLAN_BUSINESS,
												currentPlan: false,
												userIsOwner: false,
											},
										],
									},
								},
							},
						} )
					);
					const { result } = renderHook( () =>
						useCheckPlanAvailabilityForPurchase( { planSlugs: [ PLAN_BUSINESS ] } )
					);

					expect( result.current ).toEqual( { [ PLAN_BUSINESS ]: true } );
				} );
			} );
		} );

		describe( 'and the selected site is on a higher tier plan', () => {
			const businessPlan = {
				product_id: 1008,
				product_slug: PLAN_BUSINESS,
				product_name_short: 'Business',
				expired: false,
				user_is_owner: true,
				is_free: false,
			};

			describe( 'and the plan being evaluated is a lower tier plan', () => {
				it( 'marks the plan as not purchasable', () => {
					useSelector.mockImplementation( ( selector ) =>
						selector( {
							ui: { selectedSiteId },
							sites: {
								items: {
									123123: { plan: businessPlan },
								},
								plans: {
									[ selectedSiteId ]: {
										data: [
											{
												productName: 'WordPress.com Free',
												productSlug: PLAN_FREE,
												currentPlan: false,
												userIsOwner: false,
											},
											{
												productName: 'WordPress.com Business',
												productSlug: PLAN_BUSINESS,
												currentPlan: true,
												useIsOwner: true,
											},
										],
									},
								},
							},
						} )
					);
					const { result } = renderHook( () =>
						useCheckPlanAvailabilityForPurchase( { planSlugs: [ PLAN_BUSINESS ] } )
					);

					expect( result.current ).toEqual( { [ PLAN_BUSINESS ]: false } );
				} );
			} );
		} );
	} );

	describe( 'when a site is not selected', () => {
		it( 'assumes that the hook is being called from onboarding or signup and marks the plan as purchasable', () => {
			useSelector.mockImplementation( ( selector ) =>
				selector( {
					ui: { selectedSiteId: undefined },
					sites: { items: [], plans: {} },
				} )
			);
			const { result } = renderHook( () =>
				useCheckPlanAvailabilityForPurchase( { planSlugs: [ PLAN_BUSINESS ] } )
			);

			expect( result.current ).toEqual( { [ PLAN_BUSINESS ]: true } );
		} );
	} );
} );
