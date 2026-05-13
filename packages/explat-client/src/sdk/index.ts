export const SDK_VERSION = '0.1.0';

export type {
	Range,
	FeatureValue,
	ValueType,
	IdentityAttribute,
	ConditionField,
	ConditionOperatorObject,
	Condition,
	ExperimentVariation,
	ForceRule,
	ExperimentRule,
	Rule,
	Feature,
	Attributes,
	Result,
} from './types';

export { hashFnv32a, hash } from './hash';
export { getBucketRanges, getEqualWeights, chooseVariation, inRange } from './bucket';
export { evalCondition } from './condition';
export { evalFeature } from './evaluator';
