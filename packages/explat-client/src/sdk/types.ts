export type Range = [ number, number ];

export type FeatureValue =
	| string
	| number
	| boolean
	| FeatureValue[]
	| { [ key: string ]: FeatureValue };

/**
 * Widen literal primitive types to their base type so caller defaults like
 * `false` or `'control'` type as `boolean` / `string` on return. Without this,
 * `getFeatureValue('k', false)` would over-narrow to literal `false` and
 * exclude `true` as a possible result.
 */
export type WidenPrimitives< T > = T extends boolean
	? boolean
	: T extends number
	? number
	: T extends string
	? string
	: T;

export type ValueType = 'string' | 'boolean' | 'number' | 'json';

// Identity slots are explicit per system. There is no generic "user_id" —
// hashing, dedupe, and Tracks writes need an unambiguous owner.
export type IdentityAttribute =
	| 'anon_id'
	| 'wpcom_user_id'
	| 'dayone_user_id'
	| 'pocketcasts_user_id';

export type ConditionField = IdentityAttribute | 'country' | 'language';

export interface ConditionOperatorObject {
	$eq?: string;
	$in?: string[];
	$exists?: boolean;
}

export type Condition = {
	[ field in ConditionField ]?: string | string[] | ConditionOperatorObject;
} & {
	$and?: Condition[];
	$or?: Condition[];
};

export interface ExperimentVariation {
	name: string;
	value: FeatureValue;
	is_default: boolean;
	experiment_variation_id: number;
	range: Range;
}

export interface ForceRule {
	type: 'force';
	value: FeatureValue;
	condition?: Condition | null;
}

export interface ExperimentRule {
	type: 'experiment';
	seed: string;
	hash_attribute: IdentityAttribute;
	variations?: ExperimentVariation[] | null;
	experiment_id: number;
	condition?: Condition | null;
}

export type Rule = ForceRule | ExperimentRule;

export interface Feature {
	value_type: ValueType;
	default_value: FeatureValue;
	rules: Rule[];
}

export type Attributes = Partial< Record< ConditionField, string | null > >;

export type Result =
	| { value: FeatureValue; source: 'force' }
	| {
			value: FeatureValue;
			source: 'experiment';
			experiment_id: number;
			experiment_variation_id: number;
			hash_attribute: IdentityAttribute;
			hash_value: string;
	  }
	| { value: FeatureValue; source: 'default' };
