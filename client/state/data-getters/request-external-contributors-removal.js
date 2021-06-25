/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import requestExternalContributorsId from './request-external-contributors-id';

const requestExternalContributorsRemoval = ( siteId, userId ) => {
	const requestId = requestExternalContributorsId( siteId );
	const id = `${ requestId }-removal-${ userId }`;
	return requestHttpData(
		id,
		http( {
			method: 'POST',
			path: `/sites/${ siteId }/external-contributors/remove`,
			apiNamespace: 'wpcom/v2',
			body: { user_id: userId },
		} ),
		{
			fromApi: () => ( data ) => [ [ requestId, data ] ],
		}
	);
};

export default requestExternalContributorsRemoval;
