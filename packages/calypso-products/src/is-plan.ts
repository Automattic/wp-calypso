import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PLAN_HOST_BUNDLE, PLAN_WPCOM_ENTERPRISE } from './constants';
import { getPlansSlugs, isFreePlan } from './main';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isPlan( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	const slug = camelOrSnakeSlug( product );
	if ( isFreePlan( slug ) ) {
		return false;
	}
	switch ( slug ) {
		case PLAN_HOST_BUNDLE:
		case PLAN_WPCOM_ENTERPRISE:
			return true;
		default:
			return getPlansSlugs().includes( slug );
	}
}
