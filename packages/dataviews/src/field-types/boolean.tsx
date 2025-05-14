/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type {
	DataViewRenderFieldProps,
	SortDirection,
	ValidationContext,
} from '../types';
import { renderFromElements } from '../utils';

function sort( a: any, b: any, direction: SortDirection ) {
	const boolA = Boolean( a );
	const boolB = Boolean( b );

	if ( boolA === boolB ) {
		return 0;
	}

	// In ascending order, false comes before true
	if ( direction === 'asc' ) {
		return boolA ? 1 : -1;
	}

	// In descending order, true comes before false
	return boolA ? -1 : 1;
}

function isValid( value: any, context?: ValidationContext ) {
	if ( ! [ true, false, undefined ].includes( value ) ) {
		return false;
	}

	return true;
}

export default {
	sort,
	isValid,
	Edit: 'boolean',
	render: ( { item, field }: DataViewRenderFieldProps< any > ) => {
		if ( field.elements ) {
			return renderFromElements( { item, field } );
		}

		if ( field.getValue( { item } ) === true ) {
			return __( 'True' );
		}

		if ( field.getValue( { item } ) === false ) {
			return __( 'False' );
		}

		return null;
	},
	enableSorting: true,
};
