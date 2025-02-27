import { useState } from 'react';
import { FilterType, LogType, LogQueryParams } from 'calypso/data/hosting/use-site-logs-query';
import {
	VALUES_STATUS,
	VALUES_REQUEST_TYPE,
	VALUES_RENDERER,
	VALUES_SEVERITY,
	VALUES_CACHED,
} from './use-fields';
import type { View, Filter } from '@wordpress/dataviews';

const getSortField = ( logType: LogType ) => ( logType === LogType.PHP ? 'timestamp' : 'date' );
const getVisibleFields = ( logType: LogType ) => {
	if ( logType === LogType.PHP ) {
		return [ 'severity', 'message' ];
	}
	return [ 'request_type', 'status', 'request_url' ];
};
const getFilterValue = ( view: View, fieldName: string ) =>
	view.filters?.filter( ( filter ) => filter.field === fieldName )?.[ 0 ]?.value;

const getFilterParamsFromView = ( view: View, fieldNames: string[] ): FilterType => {
	return ( view.filters || [] )
		.filter( ( filter ) => fieldNames.includes( filter.field ) )
		.reduce( ( acc: FilterType, filter ) => {
			if ( filter.value ) {
				acc[ filter.field ] = filter.value;
			}
			return acc;
		}, {} as FilterType );
};

function toFilterParams( { view, logType }: { view: View; logType: LogType } ): FilterType {
	if ( logType === LogType.PHP ) {
		return getFilterParamsFromView( view, [ 'severity' ] );
	}

	return getFilterParamsFromView( view, [ 'cached', 'request_type', 'status', 'renderer' ] );
}

function fromFilterParams( query: LogQueryParams ): Filter[] {
	const filters = [];

	const severity = query.severity?.split( ',' ) || [];
	if ( severity.length > 0 && severity.every( ( s ) => VALUES_SEVERITY.includes( s ) ) ) {
		filters.push( { field: 'severity', operator: 'isAny' as const, value: severity } );
	}

	const request_type = query.request_type?.split( ',' ) || [];
	if (
		request_type.length > 0 &&
		request_type.every( ( r ) => VALUES_REQUEST_TYPE.includes( r ) )
	) {
		filters.push( { field: 'request_type', operator: 'isAny' as const, value: request_type } );
	}

	const status = query.status?.split( ',' ) || [];
	if ( status.length > 0 && status.every( ( s ) => VALUES_STATUS.includes( s ) ) ) {
		filters.push( { field: 'status', operator: 'isAny' as const, value: status } );
	}

	const renderer = query.renderer?.split( ',' ) || [];
	if ( renderer.length > 0 && renderer.every( ( r ) => VALUES_RENDERER.includes( r ) ) ) {
		filters.push( { field: 'renderer', operator: 'isAny' as const, value: renderer } );
	}

	const cached = query.cached?.split( ',' ) || [];
	if ( cached.length > 0 && cached.every( ( c ) => VALUES_CACHED.includes( c ) ) ) {
		filters.push( { field: 'cached', operator: 'isAny' as const, value: cached } );
	}

	return filters;
}

const useView = ( { logType, query }: { logType: LogType; query: LogQueryParams } ) => {
	return useState< View >( () => {
		return {
			type: 'table' as const,
			page: 1,
			perPage: 50,
			sort: {
				field: getSortField( logType ),
				direction: 'desc',
			},
			filters: fromFilterParams( query ),
			titleField: getSortField( logType ),
			fields: getVisibleFields( logType ),
			layout: {
				styles: {
					// PHP errors
					timestamp: {
						maxWidth: '150px',
					},
					severity: {
						maxWidth: '150px',
					},
					message: {
						minWidth: '300px',
					},
					file: {
						minWidth: '300px',
					},
					// Server errors
					date: {
						maxWidth: '150px',
					},
					request_url: {
						minWidth: '300px',
					},
					http_referer: {
						minWidth: '300px',
					},
				},
			},
		};
	} );
};

export default useView;
export { toFilterParams, getSortField, getVisibleFields, getFilterValue };
