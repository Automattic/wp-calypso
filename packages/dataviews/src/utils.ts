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

export const getValueFromId =
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
