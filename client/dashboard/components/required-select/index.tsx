import type { Field } from '@wordpress/dataviews';

// Utility type used ensure a select field is being passed to `removeSelectItemOption`.
// If you get an error due to this type, make sure that the field description being
// passed to `removeSelectItemOption` has the correct `Edit` and `elements` fields expected
// for a select form field.
type SelectField< Item > = Omit< Field< Item >, 'Edit' | 'elements' > & {
	Edit: 'select';
	elements: NonNullable< Field< Item >[ 'elements' ] >;
};

// Wrapper for removing the default "Select item" option from select fields.
// The dataform will not show the "Select item" text if one of the elements has
// an empty value (that's because it treats that one as the default/empty state).
// This wrapper works by transforming the first option in `elements` into an
// empty option and then using getValue/setValue to transform the value from/to
// the real value.
export function removeSelectItemOption< Item >( field: SelectField< Item > ): Field< Item > {
	const defaultElementValue = field.elements[ 0 ].value;

	return {
		...field,
		elements: [ { value: '', label: field.elements[ 0 ].label }, ...field.elements.slice( 1 ) ],
		getValue: ( args ) => {
			const value = field.getValue ? field.getValue( args ) : args.item[ field.id as keyof Item ];
			return value === defaultElementValue ? '' : value;
		},
		setValue: ( args ) => {
			const value = args.value === '' ? defaultElementValue : args.value;
			return field.setValue
				? field.setValue( { item: args.item, value } )
				: ( { [ field.id ]: value } as Partial< Item > );
		},
	};
}
