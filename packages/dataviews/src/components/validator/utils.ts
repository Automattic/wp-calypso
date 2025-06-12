import { Field, FormField } from '../../types';
import { INPUT_VALIDATION_RULES } from './constant';
import { NormalizedRule, Rule, Rules } from './types';

export const normalizeRules = ( rules: Rules ): NormalizedRule[] => {
	return Object.entries( rules ).map( ( [ key, value ] ) => {
		return {
			type: key,
			message: value.message,
			// @ts-ignore
			callback: generateCallback( key, value ),
		} as NormalizedRule;
	} );
};

const generateCallback = (
	type: keyof typeof INPUT_VALIDATION_RULES,
	rule: Rule
) => {
	if ( type === INPUT_VALIDATION_RULES.required ) {
		return ( value: any ) => {
			return value ? undefined : rule.message;
		};
	}

	if ( type === INPUT_VALIDATION_RULES.pattern ) {
		return ( value: any ) => {
			return value.match( new RegExp( rule.message ) )
				? undefined
				: rule.message;
		};
	}

	if ( type === INPUT_VALIDATION_RULES.minLength ) {
		return ( value: any ) => {
			return value.length >= rule.value ? undefined : rule.message;
		};
	}

	if ( type === INPUT_VALIDATION_RULES.maxLength ) {
		return ( value: any ) => {
			return value.length <= rule.value ? undefined : rule.message;
		};
	}

	return () => undefined;
};
