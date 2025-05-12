/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	FieldType,
	SortDirection,
	ValidationContext,
} from '../types';
import { default as integer } from './integer';
import { default as text } from './text';
import { default as datetime } from './datetime';
import { default as boolean } from './boolean';
import { renderFromElements } from '../utils';

/**
 *
 * @param {FieldType} type The field type definition to get.
 *
 * @return A field type definition.
 */
export default function getFieldTypeDefinition< Item >( type?: FieldType ) {
	if ( 'integer' === type ) {
		return integer;
	}

	if ( 'text' === type ) {
		return text;
	}

	if ( 'datetime' === type ) {
		return datetime;
	}

	if ( 'boolean' === type ) {
		return boolean;
	}

	return {
		sort: ( a: any, b: any, direction: SortDirection ) => {
			if ( typeof a === 'number' && typeof b === 'number' ) {
				return direction === 'asc' ? a - b : b - a;
			}

			return direction === 'asc'
				? a.localeCompare( b )
				: b.localeCompare( a );
		},
		isValid: ( value: any, context?: ValidationContext ) => {
			if ( context?.elements ) {
				const validValues = context?.elements?.map( ( f ) => f.value );
				if ( ! validValues.includes( value ) ) {
					return false;
				}
			}

			return true;
		},
		Edit: () => null,
		render: ( { item, field }: DataViewRenderFieldProps< Item > ) => {
			return field.elements
				? renderFromElements( { item, field } )
				: field.getValue( { item } );
		},
	};
}
