/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { POST_TYPES_REQUEST } from 'state/action-types';
import { receivePostTypes } from 'state/post-types/actions';

const handlePostTypesRequest = dispatchRequestEx( {
	fetch: action =>
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

export default {
	[ POST_TYPES_REQUEST ]: [ handlePostTypesRequest ],
};
