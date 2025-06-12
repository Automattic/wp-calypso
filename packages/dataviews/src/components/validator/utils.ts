import { Field, FormField, NormalizedField } from '../../types';
import { INPUT_VALIDATION_RULES } from './constant';
import {
	isLengthRule,
	isMaxRule,
	isMinRule,
	isPatternRule,
	isRequiredRule,
	isValidateRule,
} from './guards';

import { NormalizedRule, Rule, Rules } from './types';

export const normalizeRules = < Item >(
	rules: Rules< Item >
): NormalizedRule< Item >[] => {
	return Object.entries( rules ).map( ( [ key, value ] ) => {
		return {
			type: key,
			...( 'message' in value && { message: value.message } ),
			// @ts-expect-error - TODO: fix this
			callback: generateCallback( key, value ),
		} as NormalizedRule< Item >;
	} );
};

const generateCallback = < Item >(
	type: keyof typeof INPUT_VALIDATION_RULES,
	rule: Rule< Item >
) => {
	if ( isRequiredRule( rule ) ) {
		return ( value: string | boolean ) => {
			return value ? undefined : rule.message;
		};
	}

	if ( isPatternRule( rule ) ) {
		return ( value: any ) => {
			return value.match( new RegExp( rule.message ) )
				? undefined
				: rule.message;
		};
	}

	if ( isLengthRule( rule ) && type === 'minLength' ) {
		return ( value: any ) => {
			return value.length >= rule.value ? undefined : rule.message;
		};
	}

	if ( isLengthRule( rule ) && type === 'maxLength' ) {
		return ( value: any ) => {
			return value.length <= rule.value ? undefined : rule.message;
		};
	}

	if ( isValidateRule( rule ) ) {
		return ( value: any, field: NormalizedField< Item >, item: Item ) => {
			return rule.callback( value, field, item );
		};
	}

	if ( isMinRule( rule ) && type === 'min' ) {
		return ( value: any ) => {
			const valueNumber = Number( value );
			return valueNumber >= rule.value ? undefined : rule.message;
		};
	}

	if ( isMaxRule( rule ) && type === 'max' ) {
		return ( value: any ) => {
			const valueNumber = Number( value );
			return valueNumber <= rule.value ? undefined : rule.message;
		};
	}

	return () => undefined;
};
