import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import { FILTER_TYPE_INSTALL, FILTER_TYPE_STORAGE, FILTER_TYPE_VISITS } from '../constants';
import { FilterType } from '../types';
import { PressablePlan } from './get-pressable-plan';

export default function getSliderOptions(
	type: FilterType,
	plans: PressablePlan[],
	category?: string
) {
	return plans
		.filter( ( plan ) => plan !== undefined )
		.filter( ( plan ) => category === undefined || plan.category === category ) // Maybe only return plans of a specific category
		.sort( ( planA, planB ) => planA.install - planB.install ) // Ensure our options are sorted by install count
		.map( ( plan ) => {
			let label = '';

			if ( type === FILTER_TYPE_INSTALL ) {
				label = `${ plan.install }`;
			} else if ( type === FILTER_TYPE_VISITS ) {
				label = `${ formatNumber( plan.visits ) }`;
			} else if ( type === FILTER_TYPE_STORAGE ) {
				label = `${ plan.storage }GB`;
			}

			return {
				label,
				value: plan.slug,
				category: plan.category,
			};
		} );
}
