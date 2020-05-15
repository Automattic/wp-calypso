/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOME_LAYOUT_REQUEST, HOME_LAYOUT_SKIP_CURRENT_VIEW } from 'state/action-types';
import { setHomeLayout } from 'state/home/actions';
import config from 'config';

const requestLayout = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/home/layout`,
			apiNamespace: 'wpcom/v2',
			...( config.isEnabled( 'home/layout-dev' ) && { query: { dev: true } } ),
		},
		action
	);
};

const skipCurrentView = ( action ) => {
	return http(
		{
			method: 'POST',
			path: `/sites/${ action.siteId }/home/layout/skip`,
			apiNamespace: 'wpcom/v2',
			...( config.isEnabled( 'home/layout-dev' ) && { query: { dev: true } } ),
			body: {},
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
	[ HOME_LAYOUT_SKIP_CURRENT_VIEW ]: [
		dispatchRequest( {
			fetch: skipCurrentView,
			onSuccess: setLayout,
		} ),
	],
} );
