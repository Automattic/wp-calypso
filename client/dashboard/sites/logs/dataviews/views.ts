import { useState } from '@wordpress/element';
import { LogType, FilterType } from '../../../data/site-logs';
import type { View } from '@wordpress/dataviews';

const getSortField = ( logType: LogType ) => ( logType === LogType.PHP ? 'timestamp' : 'date' );

const getVisibleFields = ( logType: LogType ) =>
	logType === LogType.PHP
		? [ 'severity', 'name', 'message' ]
		: [ 'request_type', 'status', 'request_url' ];

// Convert current view filters to API filter params
const getFilterParamsFromView = ( view: View, fieldNames: string[] ): FilterType => {
	const allowed = new Set( fieldNames );
	const out: FilterType = {};

	for ( const filter of view.filters ?? [] ) {
		if ( ! allowed.has( filter.field ) ) {
			continue;
		}

		const raw = Array.isArray( filter.value ) ? filter.value : [];
		const values = Array.from( new Set( raw.map( String ) ) )
			.filter( Boolean )
			.sort();

		if ( values.length ) {
			out[ filter.field ] = values;
		}
	}

	return out;
};

export function toFilterParams( { view, logType }: { view: View; logType: LogType } ): FilterType {
	if ( logType === LogType.PHP ) {
		return getFilterParamsFromView( view, [ 'severity' ] );
	}

	return getFilterParamsFromView( view, [ 'cached', 'request_type', 'status', 'renderer' ] );
}

export function useView( {
	logType,
	initialFilters,
}: {
	logType: LogType;
	initialFilters?: View[ 'filters' ];
} ) {
	return useState< View >( () => ( {
		type: 'table',
		page: 1,
		perPage: 50,
		sort: {
			field: getSortField( logType ),
			direction: 'desc',
		},
		filters: initialFilters ?? [],
		titleField: getSortField( logType ),
		fields: getVisibleFields( logType ),
		layout: {
			styles: {
				// PHP errors
				timestamp: { maxWidth: '150px' },
				severity: { maxWidth: '150px' },
				name: { maxWidth: '200px', minWidth: '75px' },
				message: { maxWidth: '30vw' },
				file: { minWidth: '300px' },
				// Server errors
				date: { maxWidth: '150px' },
				request_url: { minWidth: '300px' },
				http_referer: { minWidth: '300px' },
			},
		},
	} ) );
}
