/** @format */
/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { fetchConciergeShiftsSuccess, fetchConciergeShiftsFailed } from 'state/concierge/actions';
import { CONCIERGE_SHIFTS_FETCH } from 'state/action-types';

export const fetchConciergeChats = ( { dispatch }, action ) => {
	const { scheduleId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/concierge/schedules/${ scheduleId }/shifts`,
				apiNamespace: 'wpcom/v2',
				retryPolicy: noRetry(),
			},
			action
		)
	);
};

export default {
	[ CONCIERGE_SHIFTS_FETCH ]: [
		dispatchRequest( fetchConciergeChats, fetchConciergeShiftsSuccess, fetchConciergeShiftsFailed ),
	],
};
