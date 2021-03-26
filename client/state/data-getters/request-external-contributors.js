/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import requestExternalContributorsId from './request-external-contributors-id';

const requestExternalContributors = ( siteId ) =>
	requestHttpData(
		requestExternalContributorsId( siteId ),
		http( {
			method: 'GET',
			path: `/sites/${ siteId }/external-contributors`,
			apiNamespace: 'wpcom/v2',
		} ),
		{
			fromApi: () => ( data ) => [ [ requestExternalContributorsId( siteId ), data ] ],
		}
	);

export default requestExternalContributors;
