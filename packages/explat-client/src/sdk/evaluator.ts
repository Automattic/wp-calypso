// ExPlat SDK — pure assignment function. Walks a flag's rule list in order;
// the first rule whose condition (if any) passes and whose action resolves to
// a value wins. Force rules return their literal value; experiment rules hash
// the named identity attribute and pick a variation.
//
// No DB, no globals, no clocks, no I/O. cases.json runs identical inputs
// through every runtime; if this drifts from the PHP impl, CI fails.

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
		const hashAttr: IdentityAttribute = rule.hash_attribute;
		const hashValue = ( attrs as Record< IdentityAttribute, string | null | undefined > )[
			hashAttr
		];
		if ( typeof hashValue !== 'string' || hashValue === '' ) {
			continue;
		}

		const n = hash( rule.seed, hashValue );
		const i = chooseVariation( n, rule.variations );
		if ( i < 0 ) {
			continue;
		}

		const variation = rule.variations[ i ];
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
