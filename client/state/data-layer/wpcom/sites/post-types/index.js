/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_TYPES_REQUEST } from 'state/action-types';
import { receivePostTypes } from 'state/post-types/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const handlePostTypesRequest = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/post-types`,
			},
			action
		),
	onSuccess: ( action, data ) => receivePostTypes( action.siteId, data.post_types ),
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/post-types/index.js', {
	[ POST_TYPES_REQUEST ]: [ handlePostTypesRequest ],
} );
