import {
	isJetpackPurchasableItem,
	isJetpackLegacyItem,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { COMPARE_PLANS_QUERY_PARAM } from './constants';
import type { PlanRecommendation } from './types';
import type { Duration } from '../types';
import type {
	JetpackLegacyPlanSlug,
	JetpackPurchasableItemSlug,
} from '@automattic/calypso-products';
import type { Context } from 'page';

export function getComparePlansFromContext( context: Context ): JetpackPurchasableItemSlug[] {
	const value = context.query[ COMPARE_PLANS_QUERY_PARAM ] ?? '';
	const plans = value.split( ',' );

	return plans.filter( ( p: string ) => isJetpackPurchasableItem( p, { includeLegacy: true } ) );
}

export function getPlanRecommendationFromContext(
	context: Context
): PlanRecommendation | undefined {
	const plans = getComparePlansFromContext( context );

	if ( plans.length < 2 ) {
		return;
	}

	const legacyPlan = plans[ 0 ];

	if ( ! isJetpackLegacyItem( legacyPlan ) ) {
		return;
	}

	// Remove legacy plan
	plans.shift();

	const resetPlans = plans.filter( ( p: string ) => isJetpackPurchasableItem( p ) );

	if ( resetPlans.length === 0 ) {
		return;
	}

	return [
		legacyPlan,
		resetPlans as Exclude< JetpackPurchasableItemSlug, JetpackLegacyPlanSlug >[],
	];
}

export function getItemSlugByDuration< T extends string >( slug: T, duration: Duration ): T {
	const monthlySuffix = '_monthly';
	const slugBase = slug.replace( monthlySuffix, '' );

	return ( duration === TERM_MONTHLY ? slugBase + monthlySuffix : slugBase ) as T;
}
