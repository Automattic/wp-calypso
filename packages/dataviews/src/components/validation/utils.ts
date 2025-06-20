import { Field, ValidationContext } from '../../types';
import { isRequiredRule, isRulesObject } from './guards';

import { NormalizedIsValid, Rules } from './types';

export const normalizeIsValid = < Item >(
	rules:
		| ( ( item: Item, context?: ValidationContext ) => boolean )
		| Rules< Item >
		| undefined,
	getValue: ( args: { item: Item } ) => any
): NormalizedIsValid< Item > => {
	if ( rules && isRulesObject( rules ) ) {
		return generateCallback( rules, getValue );
	}

	if ( typeof rules === 'function' ) {
		return rules;
	}

	return () => true;
};

const generateCallback = < Item extends unknown >(
	rule: Rules< Item >,
	getValue: ( args: { item: Item } ) => any
) => {
	if ( isRequiredRule( rule ) ) {
		return generateIsRequiredRuleCallback( getValue );
	}

	return () => true;
};

const generateIsRequiredRuleCallback = < Item >(
	getValue: ( args: { item: Item } ) => any
) => {
	return ( item: Item, context?: ValidationContext ) => {
		const value = getValue( { item } );
		return value !== undefined && value !== '' && value !== null;
	};
};

export const createGetValidationErrors =
	< Item >(
		field: Field< Item >,
		getValue: ( args: { item: Item } ) => any
	) =>
	( item: Item ) => {
		if ( typeof field.isValid === 'function' || ! field.isValid ) {
			return [];
		}

		return Object.entries( field.isValid ).reduce(
			( acc, [ key, value ] ) => {
				if ( isRequiredRule( { [ key ]: value } as Rules< Item > ) ) {
					const isValid = generateIsRequiredRuleCallback( getValue );

					if ( ! isValid( item ) ) {
						return [ ...acc, `${ field.id } is required` ];
					}

					return acc;
				}

				return acc;
			},
			[] as string[]
		);
	};
