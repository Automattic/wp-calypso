import { useState } from 'react';
import { FilterType, LogType } from 'calypso/data/hosting/use-site-logs-query';
import type { View } from '@wordpress/dataviews';

const getSortField = ( logType: LogType ) => ( logType === 'php' ? 'timestamp' : 'date' );
const getVisibleFields = ( logType: LogType ) => {
	if ( logType === 'php' ) {
		return [ 'severity', 'message' ];
	}
	return [ 'request_type', 'status', 'request_url' ];
};
const getFilterValue = ( view: View, fieldName: string ) =>
	view.filters?.filter( ( filter ) => filter.field === fieldName )?.[ 0 ]?.value;

function buildFilter(
	logType: LogType,
	severity: string[],
	requestType: string[],
	requestStatus: string[]
): FilterType {
	const filters: FilterType = {};

	if ( logType === 'php' ) {
		if ( severity ) {
			filters.severity = severity;
		}
	}

	if ( logType === 'web' ) {
		if ( requestType ) {
			filters.request_type = requestType;
		}
		if ( requestStatus ) {
			filters.status = requestStatus;
		}
	}

	return filters;
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
					request_url: {
						maxWidth: '300px',
					},
					http_referer: {
						maxWidth: '300px',
					},
					message: {
						maxWidth: '300px',
					},
					file: {
						maxWidth: '300px',
					},
				},
			},
		};
	} );
};

export default useView;
export { buildFilter, getSortField, getVisibleFields, getFilterValue };
