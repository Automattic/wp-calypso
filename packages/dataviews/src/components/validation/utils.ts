import { ValidationContext } from '../../types';
import { isRequiredRule, isRulesObject } from './guards';

import { NormalizedRule, Rules } from './types';

export const normalizeRules = < Item >(
	isValidObject:
		| ( ( item: Item, context?: ValidationContext ) => boolean | string )
		| Rules< Item >
		| undefined,
	fieldId: string
): NormalizedRule< Item > | undefined => {
	if ( isValidObject && isRulesObject( isValidObject ) ) {
		return generateCallback( isValidObject, fieldId );
	}

	if ( typeof isValidObject === 'function' ) {
		return isValidObject;
	}

	return undefined;
};

const generateCallback = < Item extends unknown >(
	rule: Rules< Item >,
	fieldId: string
) => {
	if ( isRequiredRule( rule ) ) {
		return ( item: any, context?: ValidationContext ) => {
			const value = item[ fieldId ];
			return value === undefined || value === ''
				? `${
						fieldId.charAt( 0 ).toUpperCase() + fieldId.slice( 1 )
				  } is required`
				: true;
		};
	}

	return () => true;
};
