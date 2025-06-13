/**
 * External dependencies
 */
import type { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import getFieldTypeDefinition from './field-types';
import type {
	DataViewRenderFieldProps,
	Field,
	FieldTypeDefinition,
	NormalizedFilterByConfig,
	NormalizedField,
} from './types';
import { getControl } from './dataform-controls';
import {
	ALL_OPERATORS,
	OPERATOR_IS_ANY,
	OPERATOR_IS_NONE,
	SINGLE_SELECTION_OPERATORS,
} from './constants';

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

function getFilterBy< Item >(
	field: Field< Item >,
	fieldTypeDefinition: FieldTypeDefinition< Item >
): NormalizedFilterByConfig | false {
	if ( field.filterBy === false ) {
		return false;
	}

	if ( typeof field.filterBy === 'object' ) {
		let operators = field.filterBy.operators;

		// Assign default values if no operator was provided.
		if ( ! operators || ! Array.isArray( operators ) ) {
			operators = [ OPERATOR_IS_ANY, OPERATOR_IS_NONE ];
		}

		// Make sure only valid operators are included.
		let validOperators = ALL_OPERATORS;
		if ( typeof fieldTypeDefinition.filterBy === 'object' ) {
			validOperators = fieldTypeDefinition.filterBy.validOperators;
		}
		operators = operators.filter( ( operator ) =>
			validOperators.includes( operator )
		);

		// Do not allow mixing single & multiselection operators.
		// Remove multiselection operators if any of the single selection ones is present.
		const hasSingleSelectionOperator = operators.some( ( operator ) =>
			SINGLE_SELECTION_OPERATORS.includes( operator )
		);
		if ( hasSingleSelectionOperator ) {
			operators = operators.filter( ( operator ) =>
				SINGLE_SELECTION_OPERATORS.includes( operator )
			);
		}

		// If no operators are left at this point,
		// the filters should be disabled.
		if ( operators.length === 0 ) {
			return false;
		}

		return {
			isPrimary: !! field.filterBy.isPrimary,
			operators,
		};
	}

	if ( fieldTypeDefinition.filterBy === false ) {
		return false;
	}

	return {
		operators: fieldTypeDefinition.filterBy.defaultOperators,
	};
}

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
		const fieldTypeDefinition = getFieldTypeDefinition< Item >(
			field.type
		);
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

		const render =
			field.render ??
			function render( {
				item,
				field,
			}: DataViewRenderFieldProps< Item > ) {
				return (
					fieldTypeDefinition.render as FunctionComponent<
						DataViewRenderFieldProps< Item >
					>
				 )( { item, field } );
			};

		const filterBy = getFilterBy( field, fieldTypeDefinition );

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
			enableSorting:
				field.enableSorting ??
				fieldTypeDefinition.enableSorting ??
				true,
			filterBy,
		};
	} );
}
