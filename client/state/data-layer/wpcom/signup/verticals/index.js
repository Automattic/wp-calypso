/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { convertToCamelCase } from 'state/data-layer/utils';
import { errorNotice } from 'state/notices/actions';
import { setVerticals } from 'state/signup/verticals/actions';
import { SIGNUP_VERTICALS_REQUEST } from 'state/action-types';

export const requestVerticals = action =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/verticals',
			query: {
				search: action.search.trim(),
				limit: action.limit,
				include_preview: true,
			},
		},
		action
	);

export const storeVerticals = ( { search }, verticals ) => setVerticals( search, verticals );
export const showVerticalsRequestError = () =>
	errorNotice(
		translate( 'We encountered an error on fetching data from our server. Please try again.' )
	);

registerHandlers( 'state/data-layer/wpcom/signup/verticals', {
	[ SIGNUP_VERTICALS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestVerticals,
			onSuccess: storeVerticals,
			onError: showVerticalsRequestError,
			fromApi: convertToCamelCase,
		} ),
	],
} );
