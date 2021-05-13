/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import fromActivityTypeApi from 'calypso/state/data-layer/wpcom/sites/activity-types/from-api';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';

const requestActivityActionTypeCounts = ( siteId, filter, { freshness = 10 * 1000 } = {} ) => {
	const before = filter && filter.before ? filter.before : '';
	const after = filter && filter.after ? filter.after : '';
	const on = filter && filter.on ? filter.on : '';
	const id = `activity-log-${ siteId }-${ after }-${ before }-${ on }`;

	return requestHttpData(
		id,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/activity/count/group`,
				query: omit( filterStateToApiQuery( filter ), 'aggregate' ),
			},
			{}
		),
		{
			freshness,
			fromApi: () => ( data ) => {
				return [ [ id, fromActivityTypeApi( data ) ] ];
			},
		}
	);
};

export default requestActivityActionTypeCounts;
