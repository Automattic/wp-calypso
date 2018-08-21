/** @format */

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { SITE_OPTION_FETCH } from 'state/action-types';

function fetch( action ) {
	return http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/sites/${ action.siteId }/option`,
			query: {
				option_name: action.optionName,
			},
		},
		action
	);
}

export default {
	[ SITE_OPTION_FETCH ]: [
		dispatchRequestEx( {
			fetch,
		} ),
	],
};
