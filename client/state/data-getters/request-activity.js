/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import { fromActivityApi } from 'calypso/state/data-layer/wpcom/sites/activity/from-api';
import getRequestActivityId from './get-request-activity-id';

const requestActivity = ( siteId, rewindId, { freshness = 5 * 60 * 1000 } = {} ) => {
	const id = getRequestActivityId( siteId, rewindId );
	return requestHttpData(
		id,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/activity/${ rewindId }`,
			},
			{}
		),
		{
			freshness,
			fromApi: () => ( data ) => {
				return [ [ id, fromActivityApi( data ) ] ];
			},
		}
	);
};

export default requestActivity;
