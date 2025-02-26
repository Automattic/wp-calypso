import { useState } from 'react';
import { FilterType, LogType } from 'calypso/data/hosting/use-site-logs-query';
import type { View } from '@wordpress/dataviews';

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

const useView = ( { logType }: { logType: LogType } ) => {
	return useState< View >( () => {
		return {
			type: 'table' as const,
			page: 1,
			perPage: 50,
			sort: {
				field: getSortField( logType ),
				direction: 'desc',
			},
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
