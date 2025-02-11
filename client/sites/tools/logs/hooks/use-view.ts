import { useCallback, useState } from 'react';
import { FilterType, LogType } from 'calypso/data/hosting/use-site-logs-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
	const dispatch = useDispatch();

	const [ view, setView ] = useState< View >( () => {
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
					// Server errors
					date: {
						maxWidth: '150px',
					},
				},
			},
		};
	} );

	const oldSeverity = getFilterValue( view, 'severity' )?.sort().toString() || '';
	const setViewWithTracking = useCallback(
		( newView: View ) => {
			const severity = getFilterValue( newView, 'severity' )?.sort().toString() || '';
			if ( severity !== oldSeverity ) {
				dispatch(
					recordTracksEvent( 'calypso_site_logs_severity_filter', {
						severity,
					} )
				);
			}
			setView( newView );
		},
		[ oldSeverity, dispatch ]
	);

	return [ view, setViewWithTracking ];
};

export default useView;
export { buildFilter, getSortField, getVisibleFields, getFilterValue };
