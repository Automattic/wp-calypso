/**
 * Internal dependencies
 */
import getFieldTypeDefinition from './field-types';
import type { Field, NormalizedField } from './types';
import { getControl } from './dataform-controls';

const getValueFromId =
	( id: string ) =>
	( { item }: { item: any } ) => {
		const path = id.split( '.' );
		let value = item;
		for ( const segment of path ) {
			if ( value.hasOwnProperty( segment ) ) {
				value = value[ segment ];
			} else {
				value = undefined;
			}
		}

		return value;
	};

/**
 * Apply default values and normalize the fields config.
 *
 * @param fields Fields config.
 * @return Normalized fields config.
 */
export function normalizeFields< Item >(
	fields: Field< Item >[]
): NormalizedField< Item >[] {
	return fields.map( ( field ) => {
		const fieldTypeDefinition = getFieldTypeDefinition( field.type );

		const getValue = field.getValue || getValueFromId( field.id );

		const sort =
			field.sort ??
			function sort( a, b, direction ) {
				return fieldTypeDefinition.sort(
					getValue( { item: a } ),
					getValue( { item: b } ),
					direction
				);
			};

		const isValid =
			field.isValid ??
			function isValid( item, context ) {
				return fieldTypeDefinition.isValid(
					getValue( { item } ),
					context
				);
			};

		const Edit = getControl( field, fieldTypeDefinition );

		const renderFromElements = ( { item }: { item: Item } ) => {
			const value = getValue( { item } );
			return (
				field?.elements?.find( ( element ) => element.value === value )
					?.label || getValue( { item } )
			);
		};

		const render =
			field.render || ( field.elements ? renderFromElements : getValue );

		return {
			...field,
			label: field.label || field.id,
			header: field.header || field.label || field.id,
			getValue,
			render,
			sort,
			isValid,
			Edit,
			enableHiding: field.enableHiding ?? true,
			enableSorting: field.enableSorting ?? true,
		};
	} );
}
