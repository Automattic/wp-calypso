/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOME_REQUEST } from 'state/action-types';
import { setHomeData } from 'state/home/actions';

const requestHomeData = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/home`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const storeHomeData = ( { siteId }, legalData ) => setHomeData( siteId, legalData );

registerHandlers( 'state/data-layer/wpcom/sites/home/index.js', {
	[ HOME_REQUEST ]: [
		dispatchRequest( {
			fetch: requestHomeData,
			onSuccess: storeHomeData,
		} ),
	],
} );
