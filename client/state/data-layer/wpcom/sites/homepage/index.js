/**
 * External dependencies
 */
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_FRONT_PAGE_UPDATE } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { bypassDataLayer } from 'state/data-layer/utils';
import { updateSiteFrontPage } from 'state/sites/actions';

const updateSiteFrontPageRequest = ( action ) =>
	http(
		{
			path: `/sites/${ action.siteId }/homepage`,
			method: 'POST',
			apiVersion: '1.1',
			body: {
				is_page_on_front: 'page' === get( action.frontPageOptions, 'show_on_front' ),
				page_on_front_id: get( action.frontPageOptions, 'page_on_front' ),
				page_for_posts_id: get( action.frontPageOptions, 'page_for_posts' ),
			},
		},
		action
	);

const setSiteFrontPage = (
	{ siteId },
	{ is_page_on_front, page_on_front_id, page_for_posts_id }
) => ( dispatch ) => {
	dispatch(
		bypassDataLayer(
			updateSiteFrontPage( siteId, {
				show_on_front: is_page_on_front ? 'page' : 'posts',
				page_on_front: parseInt( page_on_front_id, 10 ),
				page_for_posts: parseInt( page_for_posts_id, 10 ),
			} )
		)
	);
};

registerHandlers( 'state/data-layer/wpcom/sites/homepage/index.js', {
	[ SITE_FRONT_PAGE_UPDATE ]: [
		dispatchRequest( {
			fetch: updateSiteFrontPageRequest,
			onSuccess: setSiteFrontPage,
			onError: noop,
		} ),
	],
} );
