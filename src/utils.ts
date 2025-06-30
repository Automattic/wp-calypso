/**
 * Internal dependencies
 */
import type { DataViewRenderFieldProps } from './types';

export function renderFromElements< Item >( {
	item,
	field,
}: DataViewRenderFieldProps< Item > ) {
	const value = field.getValue( { item } );
	return (
		field?.elements?.find( ( element ) => element.value === value )
			?.label || field.getValue( { item } )
	);
}
