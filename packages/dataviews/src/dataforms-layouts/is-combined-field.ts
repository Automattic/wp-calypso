/**
 * Internal dependencies
 */
import type { FormField, CombinedFormField } from '../types';

export function isCombinedField(
	field: FormField
): field is CombinedFormField {
	return ( field as CombinedFormField ).children !== undefined;
}
