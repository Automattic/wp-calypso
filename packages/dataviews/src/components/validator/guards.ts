import {
	LengthRule,
	PatternRule,
	RequiredRule,
	Rule,
	ValidateRule,
} from './types';

const isValidRegex = ( regex: string ) => {
	try {
		new RegExp( regex );
		return true;
	} catch ( error ) {
		return false;
	}
};

export const isRequiredRule = < Item >(
	rule: Rule< Item >
): rule is RequiredRule => {
	return 'value' in rule && typeof rule.value === 'boolean';
};

export const isLengthRule = < Item >(
	rule: Rule< Item >
): rule is LengthRule => {
	return 'value' in rule && typeof rule.value === 'number';
};

export const isPatternRule = < Item >(
	rule: Rule< Item >
): rule is PatternRule => {
	return (
		'value' in rule &&
		typeof rule.value === 'string' &&
		isValidRegex( rule.value )
	);
};

export const isValidateRule = < Item >(
	rule: Rule< Item >
): rule is ValidateRule< Item > => {
	return 'callback' in rule && typeof rule.callback === 'function';
};
