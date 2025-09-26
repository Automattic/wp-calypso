import type { Filter } from '@wordpress/dataviews';

const getFilterValues = ( filters: Filter[], field: string ): string[] => {
	const raw = filters.find( ( filter ) => filter.field === field )?.value;

	if ( Array.isArray( raw ) ) {
		return raw
			.map( ( value ) => ( typeof value === 'string' ? value : String( value ) ) )
			.filter( ( value ) => value.length > 0 );
	}

	if ( typeof raw === 'string' && raw.length > 0 ) {
		return [ raw ];
	}

	return [];
};

const setMultiValueParam = ( searchParams: URLSearchParams, key: string, values: string[] ) => {
	if ( values.length === 0 ) {
		searchParams.delete( key );
		return;
	}

	const uniqueValues = Array.from( new Set( values ) )
		.map( ( value ) => value.trim() )
		.filter( Boolean )
		.sort();

	if ( uniqueValues.length === 0 ) {
		searchParams.delete( key );
		return;
	}

	searchParams.set( key, uniqueValues.join( ',' ) );
};

export const syncFiltersSearchParams = (
	searchParams: URLSearchParams,
	allowedFields: ReadonlyArray< string >,
	filters: Filter[]
) => {
	allowedFields.forEach( ( field ) => {
		const values = getFilterValues( filters, field );
		setMultiValueParam( searchParams, field, values );
	} );
};

export const decodeSearchParam = ( value: string ): string => {
	const withSpaces = value.replace( /\+/g, ' ' );
	try {
		return decodeURIComponent( withSpaces );
	} catch {
		return withSpaces;
	}
};
