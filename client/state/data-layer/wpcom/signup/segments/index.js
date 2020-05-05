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
import { setSegments } from 'state/signup/segments/actions';
import { SIGNUP_SEGMENTS_REQUEST } from 'state/action-types';

export const requestSegments = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/segments',
		},
		action
	);

export const storeSegments = ( action, data ) => setSegments( data );
export const showSegmentsRequestError = () =>
	errorNotice(
		translate( 'We encountered an error on fetching data from our server. Please try again.' )
	);

registerHandlers( 'state/data-layer/wpcom/signup/segments', {
	[ SIGNUP_SEGMENTS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestSegments,
			onSuccess: storeSegments,
			onError: showSegmentsRequestError,
			fromApi: convertToCamelCase,
		} ),
	],
} );
