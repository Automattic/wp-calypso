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
import { getSiteTypeId } from 'state/signup/steps/site-type/selectors';
import { getCurrentFlowName } from 'state/signup/flow/selectors';

// Some flows do not choose a site type before requesting verticals. In this
// case don't send a site_type param to the API.
export const requestVerticals = ( action ) => {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/verticals',
			query: {
				search: action.search.trim(),
				...( action.siteTypeId && { site_type: action.siteTypeId } ),
				limit: action.limit,
				include_preview: true,
				allow_synonyms: true,
			},
		},
		action
	);
};

export const storeVerticals = ( { search, siteType = '' }, verticals ) =>
	setVerticals( search, siteType, verticals );
export const showVerticalsRequestError = () =>
	errorNotice(
		translate( 'We encountered an error on fetching data from our server. Please try again.' )
	);

const verticalsHandlers = dispatchRequest( {
	fetch: requestVerticals,
	onSuccess: storeVerticals,
	onError: showVerticalsRequestError,
	fromApi: convertToCamelCase,
} );

registerHandlers( 'state/data-layer/wpcom/signup/verticals', {
	// The action provides just siteType, but to call requestVerticals we need
	// a numeric siteTypeId. Since passing around both would be inconvenient,
	// we retrieve it here based on the siteType slug just to provide it to requestVerticals.
	[ SIGNUP_VERTICALS_REQUEST ]: [
		( store, action ) =>
			verticalsHandlers( store, {
				...action,
				siteTypeId: getSiteTypeId( store.getState(), action.siteType ),
				flowName: getCurrentFlowName( store.getState() ),
			} ),
	],
} );
