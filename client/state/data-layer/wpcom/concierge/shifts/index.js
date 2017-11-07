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
import { exponentialBackoff } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { updateConciergeShifts } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_SHIFTS_REQUEST } from 'state/action-types';

export const fetchConciergeShifts = ( { dispatch }, action ) => {
	const { scheduleId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/concierge/schedules/${ scheduleId }/shifts`,
				apiNamespace: 'wpcom/v2',
				retryPolicy: exponentialBackoff(),
			},
			action
		)
	);
};

export const storeFetchedConciergeShifts = ( { dispatch }, action, shifts ) =>
	dispatch( updateConciergeShifts( shifts ) );

export const showConciergeShiftsFetchError = ( { dispatch } ) =>
	dispatch(
		errorNotice(
			translate(
				"We've encountered problems trying to load available shifts. Please try again later."
			)
		)
	);

export default {
	[ CONCIERGE_SHIFTS_REQUEST ]: [
		dispatchRequest(
			fetchConciergeShifts,
			storeFetchedConciergeShifts,
			showConciergeShiftsFetchError
		),
	],
};
