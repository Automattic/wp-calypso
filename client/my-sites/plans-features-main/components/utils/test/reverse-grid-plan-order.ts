import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { reverseGridPlanOrder } from '../utils';
import type { GridPlan } from '@automattic/plans-grid-next';

const toGridPlans = ( planSlugs: string[] ) =>
	planSlugs.map( ( planSlug ) => ( { planSlug } ) ) as GridPlan[];

const toPlanSlugs = ( gridPlans: GridPlan[] ) => gridPlans.map( ( { planSlug } ) => planSlug );

describe( 'reverseGridPlanOrder', () => {
	it( 'lists the plans most expensive first and keeps Enterprise last', () => {
		const gridPlans = toGridPlans( [
			PLAN_FREE,
			PLAN_PERSONAL,
			PLAN_PREMIUM,
			PLAN_BUSINESS,
			PLAN_ECOMMERCE,
			PLAN_ENTERPRISE_GRID_WPCOM,
		] );

		expect( toPlanSlugs( reverseGridPlanOrder( gridPlans ) ) ).toEqual( [
			PLAN_ECOMMERCE,
			PLAN_BUSINESS,
			PLAN_PREMIUM,
			PLAN_PERSONAL,
			PLAN_FREE,
			PLAN_ENTERPRISE_GRID_WPCOM,
		] );
	} );

	it( 'reverses a lineup without Enterprise', () => {
		const gridPlans = toGridPlans( [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] );

		expect( toPlanSlugs( reverseGridPlanOrder( gridPlans ) ) ).toEqual( [
			PLAN_BUSINESS,
			PLAN_PREMIUM,
			PLAN_PERSONAL,
		] );
	} );

	it( 'does not mutate the given plans', () => {
		const gridPlans = toGridPlans( [ PLAN_FREE, PLAN_PERSONAL, PLAN_ENTERPRISE_GRID_WPCOM ] );

		reverseGridPlanOrder( gridPlans );

		expect( toPlanSlugs( gridPlans ) ).toEqual( [
			PLAN_FREE,
			PLAN_PERSONAL,
			PLAN_ENTERPRISE_GRID_WPCOM,
		] );
	} );
} );
