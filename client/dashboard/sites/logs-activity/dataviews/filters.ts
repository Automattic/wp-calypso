import { decodeSearchParam } from '../../logs/dataviews/url-sync';
import type { Filter } from '@wordpress/dataviews';

export const ALLOWED_FILTER_FIELDS = [ 'activity_type' ];

export const sanitizeFilters = ( filters?: Filter[] ): Filter[] =>
	( filters ?? [] ).filter( ( filter ) => ALLOWED_FILTER_FIELDS.includes( filter.field ) );

export const getInitialFiltersFromSearch = ( search: string ): Filter[] => {
	const params = new URLSearchParams( search );
	const raw = params.get( 'activity_type' );
	if ( ! raw ) {
		return [];
	}
	const values = raw
		.split( ',' )
		.map( ( token ) => decodeSearchParam( token ).trim() )
		.filter( Boolean );
	if ( values.length === 0 ) {
		return [];
	}
	return [
		{
			field: 'activity_type',
			operator: 'isAny',
			value: Array.from( new Set( values ) ),
		},
	];
};

export const getInitialSearchTermFromSearch = ( search: string ): string | undefined => {
	const params = new URLSearchParams( search );
	const raw = params.get( 'search' );
	if ( ! raw ) {
		return undefined;
	}
	const decoded = decodeSearchParam( raw ).trim();
	return decoded.length > 0 ? decoded : undefined;
};

export const extractActivityLogTypeValues = ( filters: Filter[] ): string[] => {
	const filter = filters.find( ( item ) => item.field === 'activity_type' );
	if ( ! filter ) {
		return [];
	}
	const { value } = filter;
	if ( Array.isArray( value ) ) {
		return value.filter( ( item ): item is string => typeof item === 'string' && item.length > 0 );
	}
	if ( typeof value === 'string' && value.length > 0 ) {
		return [ value ];
	}
	return [];
};

export const getValuesSignature = ( values: string[] ): string => values.slice().sort().join( ',' );
