/**
 * @vitest-environment jsdom
 */
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PREMIUM_MONTHLY,
} from '@automattic/calypso-products';
import { vi } from 'vitest';
import { isGridPlanVisible } from '../use-grid-plans';
import type { PlanSlug } from '@automattic/calypso-products';

vi.mock( 'i18n-calypso', () => {
	const translate = ( text: string ) => text;
	return {
		default: { translate },
		translate,
		useTranslate: () => translate,
		localize: ( component: unknown ) => component,
		useRtl: () => false,
	};
} );

const GRID_PLANS: PlanSlug[] = [
	PLAN_PERSONAL,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
];

describe( 'isGridPlanVisible', () => {
	it.each( [
		[
			'the site feature list, across billing terms',
			'videopress',
			[ PLAN_BUSINESS, PLAN_ECOMMERCE ],
			[ PLAN_PERSONAL, PLAN_BUSINESS_MONTHLY, PLAN_ECOMMERCE_MONTHLY ],
		],
		[
			'the site feature list over the plan definitions',
			'antispam',
			[ PLAN_BUSINESS, PLAN_ECOMMERCE ],
			[ PLAN_PERSONAL, PLAN_BUSINESS_MONTHLY, PLAN_ECOMMERCE_MONTHLY ],
		],
		[ 'the plan definitions without a list', 'republicize', undefined, GRID_PLANS ],
	] )(
		'shows the current plan and the plans with the feature, from %s',
		( _, selectedFeature, plansWithSelectedFeature, expected ) => {
			const visible = GRID_PLANS.filter( ( gridPlanSlug ) =>
				isGridPlanVisible( {
					gridPlanSlug,
					planSlugsForIntent: GRID_PLANS,
					isDisplayingPlansNeededForFeature: true,
					selectedFeature,
					plansWithSelectedFeature,
					currentPlanSlug: PLAN_PERSONAL,
				} )
			);

			expect( visible ).toEqual( expected );
		}
	);
} );
