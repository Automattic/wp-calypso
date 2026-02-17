import { formatNumberCompact } from '@automattic/number-formatters';
import {
	FILTER_TYPE_INSTALL,
	FILTER_TYPE_STORAGE,
	FILTER_TYPE_VISITS,
	PLAN_CATEGORY_PREMIUM,
} from '../constants';
import { FilterType } from '../types';
import { PressablePlan } from './get-pressable-plan';

export default function getSliderOptions(
	type: FilterType,
	plans: PressablePlan[],
	category?: string,
	compact?: boolean
) {
	return plans
		.filter( ( plan ) => plan !== undefined )
		.filter( ( plan ) => category === undefined || plan.category === category ) // Maybe only return plans of a specific category
		.sort( ( planA, planB ) =>
			category === PLAN_CATEGORY_PREMIUM
				? planA.visits - planB.visits
				: planA.install - planB.install
		) // Ensure our options are sorted by install count
		.map( ( plan ) => {
			let label = '';

			if ( type === FILTER_TYPE_INSTALL ) {
				label = `${ plan.install }`;
			} else if ( type === FILTER_TYPE_VISITS ) {
				label = `${ formatNumberCompact( plan.visits ) }`;
			} else if ( type === FILTER_TYPE_STORAGE ) {
				label = `${ plan.storage }${ compact ? '' : 'GB' }`;
			}

			return {
				label,
				value: plan.slug,
				category: plan.category,
			};
		} );
}
