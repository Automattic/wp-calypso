import { RequiredRule, Rules } from './types';

export const isRequiredRule = < Item >(
	rule: Rules< Item >
): rule is RequiredRule => {
	return 'isRequired' in rule && typeof rule.isRequired === 'boolean';
};

export const isRulesObject = < Item >(
	rule: unknown
): rule is Rules< Item > => {
	return (
		typeof rule === 'object' &&
		rule !== null &&
		'isRequired' in rule &&
		typeof rule.isRequired === 'boolean'
	);
};
