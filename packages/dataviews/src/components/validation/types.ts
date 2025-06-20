import { ValidationContext } from '../../types';
import { INPUT_VALIDATION_RULES } from './constant';

export type RequiredRule = {
	[ INPUT_VALIDATION_RULES.isRequired ]: boolean;
};

/**
 * A collection of validation rules for field validation.
 *
 * This type supports two validation approaches:
 * 1. **Serializable constraints**: Simple boolean flags like `{ isRequired: true }`
 *    that can be easily serialized and stored
 * 2. **Custom validation functions**: Callback functions that receive the item
 *    and optional validation context to perform complex validation logic
 */
export type Rules< Item > = RequiredRule | NormalizedIsValid< Item >;

export type NormalizedIsValid< Item > = (
	item: Item,
	context?: ValidationContext
) => boolean;
