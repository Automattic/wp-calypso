// ExPlat SDK — shared types for the pure feature-flag evaluator.
//
// Mirrors the PHP reference in WPCOM. Cross-runtime
// parity is gated by test/cases.json; any change to a payload shape here must
// be mirrored in PHP and exercised by a vector.

export type Range = [ number, number ];

export type FeatureValue =
	| string
	| number
	| boolean
	| FeatureValue[]
	| { [ key: string ]: FeatureValue };

export type ValueType = 'string' | 'boolean' | 'number' | 'json';

// Identity slots are explicit per system. There is no generic "user_id" —
// hashing, dedupe, and Tracks writes need an unambiguous owner.
export type IdentityAttribute =
	| 'anon_id'
	| 'wpcom_user_id'
	| 'dayone_user_id'
	| 'pocketcasts_user_id';

export type ConditionField = IdentityAttribute | 'country' | 'language';

export type ConditionOperatorObject = {
	$eq?: string;
	$in?: string[];
	$exists?: boolean;
};

export type Condition = {
	[ field in ConditionField ]?: string | string[] | ConditionOperatorObject;
} & {
	$and?: Condition[];
	$or?: Condition[];
};

export type ExperimentVariation = {
	name: string;
	value: FeatureValue;
	is_default: boolean;
	experiment_variation_id: number;
	range: Range;
};

export type ForceRule = {
	type: 'force';
	value: FeatureValue;
	condition?: Condition | null;
};

export type ExperimentRule = {
	type: 'experiment';
	seed: string;
	hash_attribute: IdentityAttribute;
	variations: ExperimentVariation[];
	experiment_id: number;
	condition?: Condition | null;
};

export type Rule = ForceRule | ExperimentRule;

export type Feature = {
	value_type: ValueType;
	default_value: FeatureValue;
	rules: Rule[];
};

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
