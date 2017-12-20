/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeAvailableTimes } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_AVAILABLE_TIMES_REQUEST } from 'state/action-types';
import fromApi from './from-api';

export const fetchConciergeAvailableTimes = ( { dispatch }, action ) => {
	const { scheduleId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/concierge/schedules/${ scheduleId }/available_times`,
				apiNamespace: 'wpcom/v2',
			},
			action
		)
	);
};

export const storeFetchedConciergeAvailableTimes = ( { dispatch }, action, availableTimes ) =>
	dispatch( updateConciergeAvailableTimes( availableTimes ) );

export const conciergeAvailableTimesFetchError = () =>
	errorNotice( translate( "We couldn't load our Concierge schedule. Please try again later." ) );

export const showConciergeAvailableTimesFetchError = ( { dispatch } ) =>
	dispatch( conciergeAvailableTimesFetchError() );

export default {
	[ CONCIERGE_AVAILABLE_TIMES_REQUEST ]: [
		dispatchRequest(
			fetchConciergeAvailableTimes,
			storeFetchedConciergeAvailableTimes,
			showConciergeAvailableTimesFetchError,
			{ fromApi }
		),
	],
};
