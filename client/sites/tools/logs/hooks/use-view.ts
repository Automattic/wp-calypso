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

function buildFilter( {
	logType,
	cached,
	renderer,
	requestType,
	severity,
	status,
}: {
	logType: LogType;
	cached?: string[];
	renderer?: string[];
	requestType?: string[];
	severity?: string[];
	status?: string[];
} ): FilterType {
	const filters: FilterType = {};

	if ( logType === 'php' ) {
		if ( severity ) {
			filters.severity = severity;
		}
	}

	if ( logType === 'web' ) {
		if ( cached ) {
			filters.cached = cached;
		}

		if ( requestType ) {
			filters.request_type = requestType;
		}
		if ( status ) {
			filters.status = status;
		}
		if ( renderer ) {
			filters.renderer = renderer;
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
export { buildFilter, getSortField, getVisibleFields, getFilterValue };
