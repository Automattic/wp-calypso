import { numberFormatCompact } from 'i18n-calypso';
import { FILTER_TYPE_INSTALL, FILTER_TYPE_STORAGE, FILTER_TYPE_VISITS } from '../constants';
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
		.sort( ( planA, planB ) => planA.install - planB.install ) // Ensure our options are sorted by install count
		.map( ( plan ) => {
			let label = '';

			if ( type === FILTER_TYPE_INSTALL ) {
				label = `${ plan.install }`;
			} else if ( type === FILTER_TYPE_VISITS ) {
				label = `${ numberFormatCompact( plan.visits ) }`;
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
