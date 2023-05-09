import { HOSTING_GEO_AFFINITY_REQUEST, HOSTING_GEO_AFFINITY_SET } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const getGeoAffinity = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/hosting/geo-affinity`,
			apiNamespace: 'wpcom/v2',
			body: {},
		},
		action
	);

const getGeoAffinitySuccess = ( action, geoAffinity ) => {
	return {
		type: HOSTING_GEO_AFFINITY_SET,
		siteId: action.siteId,
		setting: geoAffinity,
	};
};

registerHandlers( 'state/data-layer/wpcom/sites/hosting/geo-affinity.js', {
	[ HOSTING_GEO_AFFINITY_REQUEST ]: [
		dispatchRequest( {
			fetch: getGeoAffinity,
			onSuccess: getGeoAffinitySuccess,
		} ),
	],
} );
