import { chooseVariation } from './bucket';
import { evalCondition } from './condition';
import { hash } from './hash';
import type { Attributes, Feature, IdentityAttribute, Result } from './types';

export function evalFeature( feature: Feature, attrs: Attributes ): Result {
	for ( const rule of feature.rules ?? [] ) {
		if ( rule.condition && ! evalCondition( attrs, rule.condition ) ) {
			continue;
		}

		if ( rule.type === 'force' ) {
			return { value: rule.value, source: 'force' };
		}

		// type === 'experiment'
		const variations = rule.variations;
		if ( ! Array.isArray( variations ) || variations.length === 0 ) {
			continue;
		}

		const hashAttr: IdentityAttribute = rule.hash_attribute;
		const hashValue = ( attrs as Record< IdentityAttribute, string | null | undefined > )[
			hashAttr
		];
		if ( typeof hashValue !== 'string' || hashValue === '' ) {
			continue;
		}

		const n = hash( rule.seed, hashValue );
		const i = chooseVariation( n, variations );
		if ( i === null ) {
			continue;
		}

		const variation = variations[ i ];
		return {
			value: variation.value,
			source: 'experiment',
			experiment_id: rule.experiment_id,
			experiment_variation_id: variation.experiment_variation_id,
			hash_attribute: hashAttr,
			hash_value: hashValue,
		};
	}

	return { value: feature.default_value, source: 'default' };
}
