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

function toFilterParams( { view, logType }: { view: View; logType: LogType } ): FilterType {
	const filters: FilterType = {};

	if ( logType === 'php' ) {
		const severity = getFilterValue( view, 'severity' );
		if ( severity ) {
			filters.severity = severity;
		}
	}

	if ( logType === 'web' ) {
		const cached = getFilterValue( view, 'cached' );
		const requestType = getFilterValue( view, 'request_type' );
		const status = getFilterValue( view, 'status' );
		const renderer = getFilterValue( view, 'renderer' );

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
export { toFilterParams, getSortField, getVisibleFields, getFilterValue };
