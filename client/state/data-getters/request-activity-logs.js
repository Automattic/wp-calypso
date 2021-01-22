/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import fromActivityLogApi from 'calypso/state/data-layer/wpcom/sites/activity/from-api';
import getRequestActivityLogsId from './get-request-activity-logs-id';

const requestActivityLogs = ( siteId, filter, { freshness = 5 * 60 * 1000 } = {} ) => {
	const id = getRequestActivityLogsId( siteId, filter );
	return requestHttpData(
		id,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/activity`,
				query: filterStateToApiQuery( filter ),
			},
			{}
		),
		{
			freshness,
			fromApi: () => ( data ) => {
				return [ [ id, fromActivityLogApi( data ) ] ];
			},
		}
	);
};

export default requestActivityLogs;
