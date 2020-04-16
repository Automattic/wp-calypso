/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOME_LAYOUT_REQUEST } from 'state/action-types';
import { setHomeLayout } from 'state/home/actions';
import config from 'config';

const requestLayout = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/home/layout`,
			apiNamespace: 'wpcom/v2',
			...( config.isEnabled( 'home/experimental-layout' ) && { query: { experimental: true } } ),
		},
		action
	);
};

const setLayout = ( { siteId }, layout ) => setHomeLayout( siteId, layout );

registerHandlers( 'state/data-layer/wpcom/sites/home/layout/index.js', {
	[ HOME_LAYOUT_REQUEST ]: [
		dispatchRequest( {
			fetch: requestLayout,
			onSuccess: setLayout,
		} ),
	],
} );
