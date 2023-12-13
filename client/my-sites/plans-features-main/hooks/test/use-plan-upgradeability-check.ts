/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import usePlanUpgradeabilityCheck from '../use-plan-upgradeability-check';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

describe( 'usePlanUpgradeabilityCheck', () => {
	const businessPlanSlug = 'business-bundle';

	describe( 'when a site is selected', () => {
		const selectedSiteId = 123123;

		describe( 'and the selected site is on a lower tier plan', () => {
			const freePlan = {
				expired: false,
				is_free: true,
				product_id: 1,
				product_name_short: 'Free',
				product_slug: 'free_plan',
				user_is_owner: false,
			};

			describe( 'and the plan being evaluated is a higher tier plan', () => {
				it( 'marks the plan as upgradeable', () => {
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
												productSlug: 'free_plan',
												currentPlan: true,
												userIsOwner: true,
											},
											{
												productName: 'WordPress.com Business',
												productSlug: 'business-bundle',
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
						usePlanUpgradeabilityCheck( { planSlugs: [ businessPlanSlug ] } )
					);

					expect( result.current ).toEqual( { [ businessPlanSlug ]: true } );
				} );
			} );
		} );

		describe( 'and the selected site is on a higher tier plan', () => {
			const businessPlan = {
				product_id: 1008,
				product_slug: 'business-bundle',
				product_name_short: 'Business',
				expired: false,
				user_is_owner: true,
				is_free: false,
			};

			describe( 'and the plan being evaluated is a lower tier plan', () => {
				it( 'marks the plan as not upgradeable', () => {
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
												productSlug: 'free_plan',
												currentPlan: false,
												userIsOwner: false,
											},
											{
												productName: 'WordPress.com Business',
												productSlug: 'business-bundle',
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
						usePlanUpgradeabilityCheck( { planSlugs: [ businessPlanSlug ] } )
					);

					expect( result.current ).toEqual( { [ businessPlanSlug ]: false } );
				} );
			} );
		} );
	} );

	describe( 'when a site is not selected', () => {
		it( 'assumes that the hook is being called from onboarding or signup and marks the plan as upgradeable', () => {
			useSelector.mockImplementation( ( selector ) =>
				selector( {
					ui: { selectedSiteId: undefined },
					sites: { items: [], plans: {} },
				} )
			);
			const { result } = renderHook( () =>
				usePlanUpgradeabilityCheck( { planSlugs: [ businessPlanSlug ] } )
			);

			expect( result.current ).toEqual( { [ businessPlanSlug ]: true } );
		} );
	} );
} );
