/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeAvailableTimes } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_AVAILABLE_TIMES_REQUEST } from 'state/action-types';
import fromApi from './from-api';

export const fetchConciergeAvailableTimes = action =>
	http(
		{
			method: 'GET',
			path: `/concierge/schedules/${ action.scheduleId }/available_times`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const storeFetchedConciergeAvailableTimes = ( action, availableTimes ) =>
	updateConciergeAvailableTimes( availableTimes );

export const conciergeAvailableTimesFetchError = () =>
	errorNotice( translate( "We couldn't load our Concierge schedule. Please try again later." ) );

export const showConciergeAvailableTimesFetchError = () => conciergeAvailableTimesFetchError();

export default {
	[ CONCIERGE_AVAILABLE_TIMES_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchConciergeAvailableTimes,
			onSuccess: storeFetchedConciergeAvailableTimes,
			onError: showConciergeAvailableTimesFetchError,
			fromApi,
		} ),
	],
};
