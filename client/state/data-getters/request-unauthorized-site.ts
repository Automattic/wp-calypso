/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import getRequestUnauthorizedSiteId from './get-request-unauthorized-site-id';

const requestUnauthorizedSite = ( siteId, { freshness = 5 * 60 * 1000 } = {} ) => {
	const id = getRequestUnauthorizedSiteId( siteId );

	return requestHttpData(
		id,
		http(
			{
				apiNamespace: 'rest/v1.2',
				method: 'GET',
				path: `/sites/${ siteId }`,
			},
			{}
		),
		{
			freshness,
		}
	);
};

export default requestUnauthorizedSite;
