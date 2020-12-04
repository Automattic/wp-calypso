/**
 * Internal dependencies
 */
import getUpgradePlanSlugFromPath from 'calypso/state/selectors/get-upgrade-plan-slug-from-path';
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM } from 'calypso/lib/plans/constants';

describe( 'getUpgradePlanSlugFromPath', () => {
	const siteId = 1234567;
	const makeState = ( s, productSlug ) => ( {
		sites: {
			plans: {
				[ s ]: {
					data: [
						{
							currentPlan: true,
							productSlug,
						},
					],
				},
			},
		},
	} );

	test( 'should return null the site cannot be upgraded to the given plan', () => {
		expect(
			getUpgradePlanSlugFromPath( makeState( siteId, PLAN_PREMIUM ), siteId, 'personal' )
		).toBeUndefined();
	} );

	test( 'should return the plan slug for the given plan if the site can be upgraded', () => {
		expect( getUpgradePlanSlugFromPath( makeState( siteId, PLAN_FREE ), siteId, 'personal' ) ).toBe(
			PLAN_PERSONAL
		);
	} );
} );
