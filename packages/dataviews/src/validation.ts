/**
 * Internal dependencies
 */
import { normalizeFields } from './normalize-fields';
import type { Field, Form } from './types';

/**
 * Whether or not the given item's value is valid according to the fields and form config.
 *
 * @param item   The item to validate.
 * @param fields Fields config.
 * @param form   Form config.
 *
 * @return A boolean indicating if the item is valid (true) or not (false).
 */
export function isItemValid< Item >(
	item: Item,
	fields: Field< Item >[],
	form: Form
): boolean {
	const _fields = normalizeFields(
		fields.filter( ( { id } ) => !! form.fields?.includes( id ) )
	);
	return _fields.every( ( field ) => {
		return field.isValid( item, { elements: field.elements } );
	} );
}
