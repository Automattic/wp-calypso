// ExPlat SDK — pure feature-flag primitives. Re-exported from
// `@automattic/explat-client` under the `ExPlatSdk` namespace so SDK names
// don't collide with the existing `loadExperimentAssignment` API surface.

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
