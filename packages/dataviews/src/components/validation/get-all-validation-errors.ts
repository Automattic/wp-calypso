import { normalizeFields } from '../../normalize-fields';
import { Field, Form } from '../../types';

export const getAllValidationErrors = < Item >(
	item: Item,
	fields: Field< Item >[],
	form: Form
) => {
	const normalizedFields = normalizeFields( fields );

	return normalizedFields.reduce(
		( acc, field ) => {
			const validationErrors = field.getValidationErrors( item );

			if ( validationErrors.length > 0 ) {
				return [
					{
						field: field.id,
						messages: validationErrors,
					},
					...acc,
				];
			}

			return acc;
		},
		[] as { field: string; messages: string[] }[]
	);
};
